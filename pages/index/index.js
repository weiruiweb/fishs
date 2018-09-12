import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


Page({
  data: {
    isShow:false,
  },
  //事件处理函数
 
  onLoad(options) {
    const self = this;
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
  
  },

  
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },
  show:function(){
    this.setData({
      isShow:false,
    })
  },
  confirm:function(){
    this.setData({
      isShow:true,
    })
  }

 
})

  