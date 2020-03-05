let engine = require('../meMatchvs/MatchvsEngine');
let response = require("../meMatchvs/MatchvsResponse");
let msg = require("../meMatchvs/MatvhsvsMessage");
let examplesData = require('../meMatchvs/ExamplesData');
let playerInfo = require('../data/PlayerInfo');
let roomInfo = require('../data/RoomInfo');
class MvsHttpApi {

    open_host = examplesData.platform === "release"? "https://vsopen.matchvs.com":"https://alphavsopen.matchvs.com";
    rank_list = "/rank/ranking_list?";
    rank_user = "/rank/grades?";
    rank_score = "/rank/scores?";                  // 上传排行榜分数

    get_game_data = "/wc5/getGameData.do?";
    set_game_data = "/wc5/setGameData.do?";
    del_game_data = "/wc5/delGameData.do?";

    set_user_data = "/wc5/setUserData.do?";
    get_user_data = "/wc5/getUserData.do?";
    del_user_data = "/wc5/delUserData.do?";

    hase_set = "/wc5/hashSet.do?";
    hash_get = "/wc5/hashGet.do?";

    counter = Math.floor(Math.random()*1000);

    // 第三方绑定
    third_bind = "/wc6/thirdBind.do?";
    gameID = roomInfo.gameID;
    userID = playerInfo.userId;
    appkey = examplesData.appKey;
    secret = examplesData.secret;

    constructor() {
    }

    getCounter(){
        return ++this.counter;
    }

    getTimeStamp(){
        return Math.floor(Date.now()/1000);
    }
    /**
     * 把参数中的 key, value  转为 key=value&key1=value2&key3=value3 形式
     * @param {any} args {key:value[, ...]} 形式
     */
    static paramsParse(args){
        let str = "";
        for(let k in args){
            let val = "";

            if ( 'object' == (typeof args[k]) ) {
                val = JSON.stringify(args[k]);
            }else{
                val = args[k];
            }
            if(str === ""){

                str = k + "=" + val;
            }else{
                str = str + "&" + k + "=" + val;
            }
        }
        return str;
    }

    /**
     * 组合 url 防止出现 host + path 出现两个 // 符号
     * @param {string} host
     * @param  {...string} params
     */
    static url_Join(host, ...params) {
        let p = "";
        params.forEach(a => {
            if (typeof a == "object") {
                throw 'the parameter can only be string ';
            }
            if (a.substring(0,1) === '/'){
                p = p + a;
            }else{
                p = p + '/' + a;
            }
        });
        if (host.substring(host.length - 1, host.length) === '/') {
            p = host.substring(0, host.length - 1) + p;
        } else {
            p = host + p;
        }
        return p;
    }


    /**
     * 指定签名参数签名
     */
    SignPoint(args, points){
        let tempobj = {}
        points.sort();
        points.forEach((val)=>{
            tempobj[val] = args[val];
        });

        if(args["seq"]){
            tempobj["seq"] = args["seq"];
        }
        if(args["ts"]){
            tempobj["ts"] = args["ts"];
        }

        let headKey = examplesData.appKey;
        let endKey = args.mode === 2? examplesData.secret: "";

        let paramStr = MvsHttpApi.paramsParse(tempobj);

        return headKey+"&"+paramStr+"&"+endKey;
    }



    dohttp(url, method, params, callback){
        let headtype =  (method === "GET" ? "text/plain" : "application/json") ;
        var request = new XMLHttpRequest();
        request.open(method, url)
        request.setRequestHeader("Content-Type",headtype);
        // request.setRequestHeader("Access-Control-Allow-Origin", "true");
        // request.setRequestHeader("Access-Control-Allow-Credentials", "true");
        if (method === "GET"){
            request.send();
        }else{
            request.send(JSON.stringify(params));
        }
        request.onerror = (e)=>{
            callback(JSON.parse(request.response), null);
        }
        request.onreadystatechange = ()=>{
            if(request.readyState === 4){
                if( request.status === 200 ){
                    callback(JSON.parse(request.responseText), null);
                }else{
                    callback(null, " http request error "+request.responseText);
                }
            }
        }
    }

    http_get(url, callback){
        this.dohttp(url, "GET", {}, callback);
    }

    http_post(url, params ,callback){
        this.dohttp(url, "POST", params, callback);
    }

    http_put(url, params, callback){
        this.dohttp(url, "PUT", params, callback);
    }

    /**
     * 获取排行榜数据
     */
    GetRankListData(callback){
        let params = {
            pageMax:10,
            period:0,
            rankName:"totlal_rank",
            self:0,
            top: 50,
            userID: this.userID|| 0,
            gameID: this.gameID,
            pageIndex:1,
            mode : 1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        params["sign"] = this.SignPoint(params, ["gameID","userID"]);
        let param = MvsHttpApi.paramsParse(params);
        this.http_get(MvsHttpApi.url_Join(this.open_host,this.rank_list)+param,callback);
    }

    /**
     * 获取保存在全局 http 接口列表的用户信息
     */
    GetUserInfoList(list,callback){
        let keyList = [];
        list.forEach(k=>{
            keyList.push({key:k});
        });

        let data = {
            gameID   : this.gameID,
            userID   : this.userID || 0,
            keyList  : keyList,
            mode:2,
            sign : "",
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };

        data.sign = this.SignPoint(data,["gameID","userID"]);
        let param = MvsHttpApi.paramsParse(data);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.get_game_data)+param, callback);
    }

    /**
     * 保存全局数据
     */
    setGameData(userID, list, callback){
        let listInfo = [];
        list.forEach(user=>{
            listInfo.push({
                key: user.userID,
                value: {
                    name:user.name,
                    avater:user.avatar,

                }
            });
        });
        let params = {
            gameID : this.gameID,
            userID : userID,
            dataList: listInfo,
            sign : "",
            mode:2,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        params.sign = this.SignPoint(params, ["gameID","userID"]);
        this.http_post(MvsHttpApi.url_Join(this.open_host, this.set_game_data), params, callback);
    }

    /**
     * 获取全局接口数据
     */
    getGameData(list,callback){
        let keyList = [];
        list.forEach(k=>{
            keyList.push({key:k});
        });
        let data = {
            gameID   : "123456",
            userID   : playerInfo.userId || 0,
            keyList  : keyList,
            sign : "",
            mode : 2,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        data.sign = this.SignPoint(data, ["gameID", "userID"]);
        let param = MvsHttpApi.paramsParse(data);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.get_game_data)+param, callback);
    }

    /**
     * 删除全局接口数据
     */
    delGameData(userID, list, callback){
        let keyList = [];
        list.forEach(k=>{
            keyList.push({key:k});
        });
        let args = {
            gameID:  this.gameID,
            userID:  userID,
            keyList: keyList,
            sign: "",
            mode:2,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        }
        args.sign = this.SignPoint(args,["gameID","userID"]);
        let params = MvsHttpApi.paramsParse(args);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.del_game_data) + params, callback);
    }

    /**
     * 获取某个用户排行
     */
    GetUserRank(userID, callback){
        let grades = {
            userID: userID,
            gameID: this.gameID,
            type: 0,                 // 类型，取值0或者1，0排行榜，1快照
            rankName: "totlal_rank", //排行榜名称
            rank: 0,                 //范围
            period: 0,               //周期，取值0或1，0当前周期，1上一周期
            mode:1,
            seq: this.getCounter(),
            ts : this.getTimeStamp(),
        }
        grades["sign"] = this.SignPoint(grades, ["gameID","userID"]);
        let param = MvsHttpApi.paramsParse(grades);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.rank_user)+param,callback);
    }

    /**
     * 保存用户接口数据
     */
    setUserData(userID, list, callback){
        let listInfo = [];
        list.forEach(user=>{
            listInfo.push({
                key: user.userID,
                value: ArrayTools.Base64Encode(JSON.stringify({ name: user.name, avatar: user.avatar })),
            });
        });
        let params = {
            gameID : this.gameID,
            userID : userID,
            dataList: listInfo,
            sign : "",
            mode : 1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        }
        params.sign = this.SignPoint(params, ["gameID", "userID"]);
        this.http_post(MvsHttpApi.url_Join(this.open_host, this.set_user_data), params, callback);
    }

    /**
     * 获取用户接口数据
     * @param {Array<number>} List
     */
    getUserData(userID, list, callback){
        let keyList = [];
        list.forEach(k=>{
            keyList.push({key:k});
        });
        let args = {
            gameID:  this.gameID,
            userID:  userID,
            keyList: keyList,
            sign: "",
            mode:1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        args.sign = this.SignPoint(args, ["gameID","userID"]);
        let params = MvsHttpApi.paramsParse(args);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.get_user_data)+params, callback);
    }

    /**
     * 删除用户接口数据
     */
    delUserData(userID, list, callback){
        let keyList = [];
        list.forEach(k=>{
            keyList.push({key:k});
        });
        let args = {
            gameID:  this.gameID,
            userID:  userID,
            keyList: keyList,
            sign: "",
            mode:1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        }
        args.sign = this.SignPoint(args, ["gameID","userID"]);
        let params = MvsHttpApi.paramsParse(args);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.del_user_data)+params, callback);
    }

    /**
     * 存哈希
     */
    hashSet(userID, k, v, callback){
        let params = {
            gameID: this.gameID,
            key: k,
            userID: userID,
            value: v,
            sign:"",
            mode : 1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        params.sign = this.SignPoint(params, ["gameID","userID","value","key"]);
        this.http_post(MvsHttpApi.url_Join(this.open_host, this.hash_get), params, callback);
    }

    /**
     * 取哈希
     */
    hashGet(userID, k, callback){
        let params = {
            gameID: this.gameID,
            key: k,
            userID: userID,
            sign:"",
            mode : 1,
            seq: this.getCounter(),
            ts:this.getTimeStamp(),
        };
        params.sign = this.SignPoint(params, ["gameID", "userID", "key"]);
        this.http_get(MvsHttpApi.url_Join(this.open_host, this.hash_get) + params, callback);
    }

    reportScore(args, callback){
        let data = {
            userID:args.userID,
            gameID:this.gameID,
            sign:"",
            items:[
                {fieldName:"score", value:args.value}
            ],
            mode:2,
            seq:this.getCounter(),
            ts:this.getTimeStamp()
        };
        data.sign = this.SignPoint(data, ["gameID","userID"]);
        let userid = args.userID;
        console.log("上报数据参数：", JSON.stringify(data));
        this.http_put(MvsHttpApi.url_Join(this.open_host, this.rank_score) , data, callback);
    }

    static TestReportScore(){
        let MvsHttpApi = new MvsHttpApi();
        test.reportScore({userID:123456, value:1000}, (res, err)=>{
            if(err){
                console.log("TestReportScore error ", err);
                return;
            }
            console.log("TestReportScore success ", res);
        });
    }
}