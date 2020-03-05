
export class NetworkStateCheck {

        static _instance = null;
        //错误码选择
        _errCodeMap = [];
        _curr = null;
        _gtwDisConn = false;
        constructor() {
            this.InitErrorData();
        }

        InitErrorData(){
            this.addErrCodeData(1001,"您的【游戏】连接断开, 需要重新登录...",this.returnSceneLogin);
            this.addErrCodeData(1002,"您的【房间】连接断开, 请重开游戏...",this.returnSceneGameLoy);
            this.addErrCodeData(406,"房间已经关闭...",this.returnSceneGameLoy);
            this.addErrCodeData(405,"房间人已经满了...",this.returnSceneGameLoy);
            this.addErrCodeData(404,"找不到您要的信息...",this.returnSceneLogin);
            this.addErrCodeData(500,"游戏服务器错误...",this.returnSceneLogin);
            this.addErrCodeData(402,"用户信息验证错误...",this.returnSceneLogin);
        }

        addErrCodeData(code, msg, call){
            this._errCodeMap[code] = {message:msg, callBack:call}
        }

        static getInstance(){
            if(NetworkStateCheck._instance == null){
                NetworkStateCheck._instance =  new NetworkStateCheck();
            }
            return NetworkStateCheck._instance;
        }

        static Release(){
            if(NetworkStateCheck._instance){
                NetworkStateCheck._instance = null;
            }
        }

        /**
         * 取消监听
         */
        CancelListen(){
            PokeMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_NETWORKSTATE,this.networkStateNotify,this);
            PokeMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_ERROR,this.NetorkError,this);
            if(this._curr && "Release" in this._curr ){
                this._curr.Release();
            }
            console.log("CancelListen:取消网络错误监听");
        }

        /**
         * 注册网络监听
         */
        RegistNetListen(obj){
            PokeMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_NETWORKSTATE,this.networkStateNotify,this);
            PokeMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_ERROR,this.NetorkError,this);
            this._curr = obj;
        }

        /**
         * 房间用户状态变化回调
         */
        networkStateNotify(e){
            let data = e.data;
            if(data.state == 3){
                this.CancelListen();
                DialogPage.ErrorPage("其他玩家网络连接断开，请返回到大厅...",this.returnSceneGameLoy,this);
            }
        }

        /**
         * 跳到大厅
         */
        returnSceneGameLoy(){
            PokeMatchvsEngine.getInstance.leaveRoom("玩家断开");
            console.info("跳到大厅");
            this._gtwDisConn = false;
            SceneManager.showScene(Game);
        }
        /**
         * 跳到登录
         */
        returnSceneLogin(){
            console.info("跳到登录");
            this._gtwDisConn = false;
            PokeMatchvsEngine.getInstance.init(MatchvsData.pChannel,MatchvsData.pPlatform,MatchvsData.gameID);
            SceneManager.showScene(Login);
        }

        /**
         * 网络错误回调
         */
        NetorkError(e) {
            let data = e.data;
            console.info("触发错误：", data.code);
            if (data.code == 1001) {
                this._gtwDisConn = true;
            }
            if (data.code == 1002 && this._gtwDisConn) {
                data.code = 1001;
            }
            let errData = this._errCodeMap[Number(data.code)];
            if (errData) {
                this.CancelListen();
                DialogPage.ErrorPage(errData.message, errData.callBack, this);
            }
            // }else{
            // 	SceneManager.ErrorPage("服务返回错误："+data.code,this.returnSceneLogin,this);
            // }
        }
}