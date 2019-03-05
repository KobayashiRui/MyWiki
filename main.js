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
        showModal: false,
        input_category:"aa",
        no_filter_wikidatas:[],
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
            let wikidatas_cp3 = [];
            let filter_DB;
            console.log(filter_name);
            switch(filter_tag){
              case 0:
                filter_DB = this.db.collection("wikidata");
                break;
              case 1://今回注文予定フィルタ
                filter_DB = this.db.collection("wikidata").where("category", "==", filter_name);
                break;
            }
            filter_DB.get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let copyObj2 = {};
                    let copyid2 = doc.id;
                    console.log(doc.data())
                    Object.assign(copyObj2 , doc.data());
                    console.log(copyObj2);
                    copyObj2.id = copyid2;
                    wikidatas_cp2.push(copyObj2);
                });
            });
            this.wikidatas=wikidatas_cp2;
            now_filter = filter_tag;

            this.now_category = filter_name;
            this.db.collection("wikidata").get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let copyObj3 = {};
                    let copyid3 = doc.id;
                    console.log(doc.data())
                    Object.assign(copyObj3 , doc.data());
                    console.log(copyObj3);
                    copyObj3.id = copyid3;
                    wikidatas_cp3.push(copyObj3);
                });
                this_.update_category();
            });
            this.no_filter_wikidatas = wikidatas_cp3;
        },
        update_category: function(){
            console.log("aaa")
            let categorys_cp2 = this.category_list.slice();

            this.no_filter_wikidatas.forEach(i => {
                console.log(i.category);
                categorys_cp2.push(i.category);
            });
            this.category_list = [... new Set(categorys_cp2)];
        }
    }
})

console.log(app);
Vue.component('modal', {
    template: '#modal-template',
    data:function(){
        return {
            input_category:"",
            input_url:"",
            data:app._data.category_list,//appのデータを参照
        }
    },
    methods: {

        add_data: function(){
            console.log("add data");
            if(this.input_category != "" && this.input_url != ""){
                app._data.db.collection("wikidata").add({
                    "category": this.input_category,
                    "url" : this.input_url,
                });
                this.input_category ="";
                this.input_url="";
                this.$emit('close');
            }else{
                alert("すべてのフォームを埋めてください");
            }
        },
    }
})