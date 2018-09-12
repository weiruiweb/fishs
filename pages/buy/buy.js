import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
   
    
    id:'',

    mainImg:[],
    submitData:{
      content:'',
      passage1:'',
      mainImg:[],
      title:'',
      keywords:'',
      phone:'',
      passage_array:'',
      product_no:'',
      passage2:'',
     
    },
      is_show:false,
      max: 400,
      currentWordNumber:400,
      spacing:'50px',
    
    
  },
  //事件处理函数
  preventTouchMove:function(e) {

  },

  onLoad(options){
    const self = this;
    self.data.id = options.id;
    self.data.submitData.product_no = options.id;
    console.log(self.data.product_no)
    self.setData({
      is_show:self.data.is_show,
      web_currentWordNumber:400
    });
    self.getMainData()
  },


  bindRegionChange: function (e) {
    const self = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    self.data.submitData.passage1 = e.detail.value[0]+e.detail.value[1]+e.detail.value[2];
    self.setData({
      web_region: e.detail.value
    })
  },

  messageAdd(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.data = {};
    postData.data = api.cloneForm(self.data.submitData);

    const callback = (data)=>{
      if(data.solely_code == 100000){
        self.data.is_show = true;
        self.setData({
          is_show:true
        })
      }else{
        api.showToast('网络故障','none',3000);
      };
      wx.hideLoading(); 
    };
    api.messageAdd(postData,callback);
      
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
      self.setData({
        web_submitData:self.data.submitData,
      });  
    console.log(self.data.submitData)
  },

  currentWordNumber(e){
    const self = this;
    var currentWordNumber = api.fillChange(e,self,'submitData');
    var value = e.detail.value;
    var len = parseInt(value.length);
    if (len > self.data.max){
      return;
    } 
      var lens = parseInt(400 - len)
      self.setData({
        web_submitData:self.data.submitData,
        web_currentWordNumber: lens,
      });  
  },

  reSetInfomation(){
    const self = this;
    self.data.submitData = {
      content:'',
      passage1:'',
      mainImg:[],
      title:'',
      keywords:'',
      phone:'',
      passage_array:'',
      product_no:'',
      passage2:'',
    };
    self.setData({
      web_submitData:self.data.submitData,
    }); 
  },


  submit(){
    const self = this;
    var name  = self.data.submitData.title;
    var id_num = self.data.submitData.keywords;
    var newObject = api.cloneForm(self.data.submitData);

    delete newObject.mainImg;
    delete newObject.passage2;
    delete newObject.passage1;

    const pass = api.checkComplete(newObject);
    if(pass){
      if(!id_num || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/.test(id_num)){
        api.showToast('身份证格式错误','none')
      }else{
        if(!/^[\u4E00-\u9FA5]+$/.test(name)){
          api.showToast('姓名格式错误','none')
        }else{
          self.messageAdd();
        }
      }
    }else{
      api.showToast('请补全信息','none');
    };
  },



  


  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      id:self.data.id
    };
    const callback = (res)=>{
      self.data.mainData = {};
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      };

      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.articleGet(postData,callback);
  },



  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },

  deleteImage(e) {
    const self = this;
    var images = self.data.submitData.mainImg;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
     title: '提示',
     content: '确定要删除此图片吗？',
     success(res) {
      if (res.confirm) {
       images.splice(index, 1);
      }else if (res.cancel) {
        return false;    
       }
      self.setData({
        web_submitData:self.data.submitData
      });
     }
    })
   },


  upLoadImg: function (){
    var self = this;
    if(self.data.submitData.mainImg.length>2){
      api.showToast('仅限3张','none');
      return;
    };
    wx.showLoading({
      mask: true,
      title: '图片上传中',
    });
    var mainImg = self.data.mainImg
    wx.chooseImage({
      count:1,
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'https://liubin.yisuiyanghuoguo.com/liubin/public/index.php/api/v1/Base/FtpImage/upload',
          filePath:tempFilePaths[0],
          name: 'file',
          formData: {
            token:wx.getStorageSync('token')
          },
          success: function(res){
            console.log(res);
            res = JSON.parse(res.data);
            console.log(res)
            if(res.solely_code==100000&&res.info&&res.info.url){ 
              self.data.submitData.mainImg.push({url:res.info.url})
              self.setData({
                web_submitData:self.data.submitData
              });
            }else{
              token.getUserInfo();
              api.showToast('请重新上传','none',3000);
            };       
            wx.hideLoading();
            

          },
          fail: function(err){
            wx.hideLoading();
            api.showToast('上传失败','none',3000)
          }
        })
      },
      fail: function(err){
        wx.hideLoading();
      }
    })
  },



  


  


 
})

  