var config = {
    apiKey: "AIzaSyDP9q_QJP7lVMtFkJj6P-e0fGztbqcuNgQ",
    authDomain: "mywiki-db-d392b.firebaseapp.com",
    databaseURL: "https://mywiki-db-d392b.firebaseio.com",
    projectId: "mywiki-db-d392b",
    storageBucket: "mywiki-db-d392b.appspot.com",
    messagingSenderId: "360283743229"
};
firebase.initializeApp(config);

var this_ = this;
var now_filter = 0; //0 : not filter 1: order filter
//var filter_name = "ALL";

var app = new Vue({
    el: '#app',
    created: function() {
        this.db = firebase.firestore();
        let wikidatas_cp = [];
        this.db.collection("wikidata").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                let copyObj = {};
                let copyid = doc.id;
                Object.assign(copyObj , doc.data());
                copyObj.id = copyid;
                //this.category_listに含まれていないなら直接this.category_listに追加できるようにする
                //console.log(categorys_cp);
                //console.log(copyObj.category);
                wikidatas_cp.push(copyObj);
            });
        });
        //console.log(categorys_cp[0]);
        this.wikidatas = wikidatas_cp;
        //let set_data = new Set(categorys_cp);

        this_ = this;
        
        //リアルタイム更新をさせる
        this.db.collection("wikidata").onSnapshot(function(querySnapshot) {
            this_.filter_data(now_filter,this_.now_category);
        });
    },
  
    data: function() {
        return {
        wikidatas:[],
        category_list : [],
        now_category : "ALL",
        db:null,
        }
    },
  
    methods: {
        get_data: function(){
            this.db.collection("wikidata").get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let copyObj = {};
                    Object.assign(copyObj , doc.data());
                    copyObj.id = doc.id;
                    this.categorys.push(copyObj);
                });
            });
        },
        change_order_now: function(collection_id){
          //参考に
          let ref = this.db.collection("order_list").doc(collection_id);
          ref.get().then(function(doc){
              console.log(doc.data());
              console.log(doc.data().Now_Order);
              if(doc.data().Now_Order == true){
                ref.update({Now_Order:false});
              }else if(doc.data().Now_Order == false){
                ref.update({Now_Order:true});
              }
          });
        },
        change_get_now: function(collection_id){    
          let ref = this.db.collection("order_list").doc(collection_id);
          ref.get().then(function(doc){
              console.log(doc.data());
              console.log(doc.data().Pickup_Date);
                ref.update({Pickup_Date:new Date()});
          });
          
        },
        delete_data: function(collection_id){
        },
        get_date: function(dt){
            console.log(dt);
            let y = dt.getFullYear();
            let m = ("00" + (dt.getMonth()+1)).slice(-2);
            let d = ("00" + dt.getDate()).slice(-2);
            let result = y + "/" + m + "/" + d;
            return result;
        },
        update_data : function(){
            let categorys_cp2 = [];
            this.db.collection("order_list").get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let copyObj2 = {};
                    let copyid2 = doc.id;
                    Object.assign(copyObj2 , doc.data());
                    copyObj2.id = copyid2;
                    categorys_cp2.push(copyObj2);
                    //console.log("update data");
                });
            });
            this.orders = orders_cp2;
        },
        filter_data : function(filter_tag,filter_name){
            let wikidatas_cp2 = [];
            let test_list = [];
            let filter_DB;
            console.log(filter_name);
            switch(filter_tag){
              case 0:
                filter_DB = this.db.collection("wikidata");
                break;
              case 1://今回注文予定フィルタ
                filter_DB = this.db.collection("wikidata").where("ategory", "==", filter_name);
                break;
            }
            //this.db.collection("order_list").where("Now_Order", "==", true).get().then(function(querySnapshot) {
            filter_DB.get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    //console.log(doc.id, " => ", doc.data());
                    //var dict_data = doc.data();
                    let copyObj2 = {};
                    let copyid2 = doc.id;
                    Object.assign(copyObj2 , doc.data());
                    //console.log(copyObj);
                    test_list.push(String(copyObj2.category));
                    copyObj2.id = copyid2;
                    wikidatas_cp2.push(copyObj2);
                    //console.log("update data");
                });
            });
            //this.category_list = Array.from(new Set(categorys_cp2));
            console.log("cp2");
            //console.log(categorys_cp2);
            //let set_data2 = new Set(categorys_cp2);
            //this.category_list = categorys_cp2;
            //console.log(this.wikidatas[0]);
            console.log(test_list);
            let categorys_cp2 =[];
            this.wikidatas.forEach(i => {
                console.log(i.category);
                //categorys_cp2.push(i.category);
                this_.category_list.push(i.category);
            });
            console.log(categorys_cp2);
            this.wikidatas=wikidatas_cp2;
            this.category_list = [... new Set(this.category_list)];//[... new Set(categorys_cp2)];
            now_filter = filter_tag;
            console.log(filter_name);
            this.now_category = filter_name;
        },
        created: function(){
        // GET request
        axios.get("https://agate-postage.glitch.me/exel_generate")
        .then(response => {
          console.log("GET!!");
          document.getElementById("download_excel").click();
        });
        },
    }
})
