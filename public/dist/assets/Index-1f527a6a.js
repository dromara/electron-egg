import{i as e}from"./main-d72f38de.js";import{i as a}from"./ipcRenderer-5e19eaee.js";import{_ as l,r as t,o as s,b as n,g as d,a as o,w as i,e as u,t as p,p as r,f as _}from"./index-c5d87696.js";const c={data:()=>({name:"李四",age:20,userList:["空"],search_age:20,update_name:"李四",update_age:31,delete_name:"李四",all_list:["空"],data_dir:""}),mounted(){this.init()},methods:{init(){a.invoke(e.sqlitedbOperation,{action:"getDataDir"}).then((e=>{-1!=e.code?(this.data_dir=e.result,this.getAllTestData()):this.$message.error("请检查sqlite是否正确安装",5)}))},getAllTestData(){a.invoke(e.sqlitedbOperation,{action:"all"}).then((e=>{if(0==e.all_list.length)return!1;this.all_list=e.all_list}))},selectDir(){a.invoke(e.selectFolder,"").then((e=>{this.data_dir=e,this.modifyDataDir(e)}))},openDir(){console.log("dd:",this.data_dir),a.invoke(e.openDirectory,{id:this.data_dir}).then((e=>{}))},modifyDataDir(l){const t={action:"setDataDir",data_dir:l};a.invoke(e.sqlitedbOperation,t).then((e=>{this.all_list=e.all_list}))},sqlitedbOperation(l){const t={action:l,info:{name:this.name,age:parseInt(this.age)},search_age:parseInt(this.search_age),update_name:this.update_name,update_age:parseInt(this.update_age),delete_name:this.delete_name};"add"==l&&0==this.name.length&&this.$message.error("请填写数据"),a.invoke(e.sqlitedbOperation,t).then((e=>{if(console.log("res:",e),"get"==l){if(0==e.result.length)return void this.$message.error("没有数据");this.userList=e.result}0!=e.all_list.length?(this.all_list=e.all_list,this.$message.success("success")):this.all_list=["空"]}))}}},m=e=>(r("data-v-62864663"),e=e(),_(),e),f={id:"app-base-db"},h=m((()=>d("div",{class:"one-block-1"},[d("span",null," 1. sqlite本地数据库 ")],-1))),v={class:"one-block-2"},b=m((()=>d("div",{class:"one-block-1"},[d("span",null," 2. 数据目录 ")],-1))),g={class:"one-block-2"},k=m((()=>d("div",{class:"one-block-1"},[d("span",null," 3. 测试数据 ")],-1))),V={class:"one-block-2"},D=m((()=>d("div",{class:"one-block-1"},[d("span",null," 4. 添加数据 ")],-1))),q={class:"one-block-2"},O=m((()=>d("div",{class:"one-block-1"},[d("span",null," 4. 获取数据 ")],-1))),C={class:"one-block-2"},U=m((()=>d("div",{class:"one-block-1"},[d("span",null," 5. 修改数据 ")],-1))),y={class:"one-block-2"},I=m((()=>d("div",{class:"one-block-1"},[d("span",null," 6. 删除数据 ")],-1))),$={class:"one-block-2"};const j=l(c,[["render",function(e,a,l,r,_,c){const m=t("a-col"),j=t("a-row"),L=t("a-input"),w=t("a-button");return s(),n("div",f,[h,d("div",v,[o(j,null,{default:i((()=>[o(m,{span:8},{default:i((()=>[u(" • 大数据量: 0-1024GB(单库) ")])),_:1}),o(m,{span:8},{default:i((()=>[u(" • 高性能 ")])),_:1}),o(m,{span:8},{default:i((()=>[u(" • 类mysql语法 ")])),_:1})])),_:1})]),b,d("div",g,[o(j,null,{default:i((()=>[o(m,{span:12},{default:i((()=>[o(L,{modelValue:_.data_dir,"onUpdate:modelValue":a[0]||(a[0]=e=>_.data_dir=e),value:_.data_dir,"addon-before":"数据目录"},null,8,["modelValue","value"])])),_:1}),o(m,{span:2}),o(m,{span:5},{default:i((()=>[o(w,{onClick:c.selectDir},{default:i((()=>[u(" 修改目录 ")])),_:1},8,["onClick"])])),_:1}),o(m,{span:5},{default:i((()=>[o(w,{onClick:c.openDir},{default:i((()=>[u(" 打开目录 ")])),_:1},8,["onClick"])])),_:1})])),_:1})]),k,d("div",V,[o(j,null,{default:i((()=>[o(m,{span:24},{default:i((()=>[u(p(_.all_list),1)])),_:1})])),_:1})]),D,d("div",q,[o(j,null,{default:i((()=>[o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.name,"onUpdate:modelValue":a[1]||(a[1]=e=>_.name=e),value:_.name,"addon-before":"姓名"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.age,"onUpdate:modelValue":a[2]||(a[2]=e=>_.age=e),value:_.age,"addon-before":"年龄"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(w,{onClick:a[3]||(a[3]=e=>c.sqlitedbOperation("add"))},{default:i((()=>[u(" 添加 ")])),_:1})])),_:1})])),_:1})]),O,d("div",C,[o(j,null,{default:i((()=>[o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.search_age,"onUpdate:modelValue":a[4]||(a[4]=e=>_.search_age=e),value:_.search_age,"addon-before":"年龄"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(w,{onClick:a[5]||(a[5]=e=>c.sqlitedbOperation("get"))},{default:i((()=>[u(" 查找 ")])),_:1})])),_:1})])),_:1}),o(j,null,{default:i((()=>[o(m,{span:24},{default:i((()=>[u(p(_.userList),1)])),_:1})])),_:1})]),U,d("div",y,[o(j,null,{default:i((()=>[o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.update_name,"onUpdate:modelValue":a[6]||(a[6]=e=>_.update_name=e),value:_.update_name,"addon-before":"姓名(条件)"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.update_age,"onUpdate:modelValue":a[7]||(a[7]=e=>_.update_age=e),value:_.update_age,"addon-before":"年龄"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(w,{onClick:a[8]||(a[8]=e=>c.sqlitedbOperation("update"))},{default:i((()=>[u(" 更新 ")])),_:1})])),_:1})])),_:1})]),I,d("div",$,[o(j,null,{default:i((()=>[o(m,{span:6},{default:i((()=>[o(L,{modelValue:_.delete_name,"onUpdate:modelValue":a[9]||(a[9]=e=>_.delete_name=e),value:_.delete_name,"addon-before":"姓名"},null,8,["modelValue","value"])])),_:1}),o(m,{span:3}),o(m,{span:6}),o(m,{span:3}),o(m,{span:6},{default:i((()=>[o(w,{onClick:a[10]||(a[10]=e=>c.sqlitedbOperation("del"))},{default:i((()=>[u(" 删除 ")])),_:1})])),_:1})])),_:1})])])}],["__scopeId","data-v-62864663"]]);export{j as default};