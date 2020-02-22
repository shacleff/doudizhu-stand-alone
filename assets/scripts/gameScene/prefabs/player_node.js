import myglobal from "../../mygolbal.js"
const ddzConstants = require('ddzConstants')
const ddzData = require('ddzData')
cc.Class({
  extends: cc.Component,

  properties: {
    headImage: cc.Sprite,
    account_label: cc.Label,
    nickname_label: cc.Label,
    // room_touxiang: cc.Sprite,
    globalcount_label: cc.Label,
    // headimage: cc.Sprite,
    readyimage: cc.Node,
    offlineimage: cc.Node,
    card_node: cc.Node,
    card_prefab: cc.Prefab,
    //tips_label:cc.Label,
    clockimage: cc.Node,
    qiangdidzhu_node: cc.Node, //抢地主的父节点
    time_label: cc.Label,
    robimage_sp: cc.SpriteFrame,
    robnoimage_sp: cc.SpriteFrame,
    robIconSp: cc.Sprite,
    robIcon_Sp: cc.Node,
    robnoIcon_Sp: cc.Node,
    masterIcon: cc.Node,
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.readyimage.active = ddzData.gameState < ddzConstants.gameState.GAMESTART
    this.offlineimage.active = false
    //  准备开始
    this.node.on("player_ready_notify", () => {
      this.readyimage.active = true
    })
    // 开始游戏(客户端发给客户端)
    this.node.on("gamestart_event", () => {
      this.readyimage.active = false
    })

    //给其他玩家发牌事件
    this.node.on("push_card_event", function (event) {
      if (this.seat_index === 0) return // 自己不再发牌
      this.pushCard()
    }.bind(this))

    this.node.on("playernode_rob_state_event", function (event) {
      //{"accountid":"2162866","state":1}
      var detail = event

      //如果是自己在抢，需要隐藏qiangdidzhu_node节点
      //this.accountid表示这个节点挂接的accountid
      if (detail.accountid == this.accountid) {
        //console.log("detail.accountid"+detail.accountid)
        this.qiangdidzhu_node.active = false

      }

      if (this.accountid == detail.accountid) {
        if (detail.state == qian_state.qian) {

          console.log("this.robIcon_Sp.active = true")
          this.robIcon_Sp.active = true

        } else if (detail.state == qian_state.buqiang) {
          this.robnoIcon_Sp.active = true

        } else {
          console.log("get rob value :" + detail.state)
        }
      }

    }.bind(this))

    this.node.on("playernode_changemaster_event", function (event) {
      var detail = event
      this.robIcon_Sp.active = false
      this.robnoIcon_Sp.active = false
      if (detail == this.accountid) {
        this.masterIcon.active = true
      }
    }.bind(this))

    // this.node.on("playernode_add_three_card",function(event){
    //   var detail = event //地主的accountid
    //   if(detail==this.accountid){
    //     //给地主发三张排

    //   }
    // }.bind(this))
  },

  start() {

  },

  //这里初始化房间内位置节点信息(自己和其他玩家)
  //data玩家节点数据
  //index玩家在房间的位置索引
  init_data(data, index) {
    // console.log("init_data:" + JSON.stringify(data))
    //data:{"accountid":"2117836","userName":"tiny543","avatarUrl":"http://xxx","goldcount":1000}
    this.accountid = data.accountid
    this.account_label.string = data.accountid
    this.nickname_label.string = data.userName
    this.globalcount_label.string = data.goldcount
    this.cardlist_node = []
    this.seat_index = index
    if (!index) {
      this.readyimage.active = false
    }
    //网络图片加载
    // cc.loader.loadRes(data.avatarUrl, cc.SpriteFrame, (err, tex) => {
    //   //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
    //   // let oldWidth = this.headImage.node.width;
    //   //console.log('old withd' + oeldWidth);
    //   if (err) return console.log(err)
    //   this.headImage.spriteFrame = tex
    //   // let newWidth = this.headImage.node.width;
    //   //console.log('old withd' + newWidth);
    //   // this.headImage.node.scale = oldWidth / newWidth;
    // });
    //这里根据传入的avarter来获取本地图像
    //console.log(str)
    var head_image_path = "UI/headimage/" + data.avatarUrl
    cc.loader.loadRes(head_image_path, cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        console.log(err.message || err);
        return;
      }
      this.headImage.spriteFrame = spriteFrame;
    }.bind(this));

    //监听内部随可以抢地主消息,这个消息会发给每个playernode节点
    this.node.on("playernode_canrob_event", function (event) {
      var detail = event
      console.log("------playernode_canrob_event detail:" + detail)
      if (detail == this.accountid) {
        this.qiangdidzhu_node.active = true
        //this.tips_label.string ="正在抢地主" 
        this.time_label.string = "10"
        //开启一个定时器

      }
    }.bind(this))
    // 更改右边机器人的扑克牌位置
    if (index == 1) {
      this.card_node.x = -this.card_node.x
    }
  },

  pushCard() {
    this.card_node.active = true
    for (var i = 0; i < 17; i++) {
      var card = cc.instantiate(this.card_prefab)
      card.scale = 0.6
      console.log(" this.card_node.parent.parent" + this.card_node.parent.parent.name)
      card.parent = this.card_node
      var height = card.height
      card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
      card.x = 0
      this.cardlist_node.push(card)
    }
  },
});