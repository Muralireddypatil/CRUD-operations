// USed to create Table in the Database
const productdb = (dbname, table)=>{
  //     const db = new Dexie('myDB');
  // db.version(1).stores({
  //     friends: '++id, name, age' // Fixed schema definition
  // });
  
  // // Open database
  // db.open().catch(err => {
  //     console.error("Failed to open DB:", err);
  // });
  
   // Add data to test if it works 
   db.friends.put({ name: 'John', age: 25 }).then(() => {
  //     console.log("Data added successfully!");
   });
  
  const db = new Dexie(dbname);
  db.version(1).stores(table);
  
  db.open();
  
  return db;
  }
  //insert function
  const bulkcreate =(dbtable,data)=>{
      // dbtable.bulkAdd([data]);
      // flag is used to check boolean value
      let flag = empty(data);
      if(flag){
          dbtable.bulkAdd([data]);
          console.log("data inserted successfully");
      }else{
        console.log("Provide Data");
      }
  
      return flag;
  }
  //get data from database
  const getData=(dbtable,fn)=>{
      let index=0;
      let obj={};
    
      dbtable.count((count)=>{
        if(count){
          dbtable.each(table=>{
              
  
              obj=Sortobj(table);
              fn(obj,index++);
              
   
      });
    }else{
      fn(0);
    }
      });
    
    };
    //sort object
    const Sortobj=sortobj=>{
      let obj={};
      obj={
        id:sortobj.id,
        name:sortobj.name,
        seller:sortobj.seller,
        price:sortobj.price,
      }
       return obj;
    }
    //create dynamic elements
    const createEle=(tagname,appendTo,fn)=>{
      const element=document.createElement(tagname);
      if(appendTo)appendTo.appendChild(element);
      if(fn)fn(element);
    }
    
  //check textbox validation
  const empty=object=>{
      let flag=false;
      for(const value in object){
          if(object[value]!=""&&object.hasOwnProperty(value)){
              flag=true;
          }else{
              flag=false; 
          }
      }
      return flag;
  }
  
  
  
  export default productdb;
  export{
      bulkcreate,
      getData,
      createEle
  }  
