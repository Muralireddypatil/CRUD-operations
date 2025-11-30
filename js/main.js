import apiService from "./api.js";

//input tags
const userid = document.getElementById("userid");
const proname = document.getElementById("proname");
const seller = document.getElementById("seller");
const price = document.getElementById("price");

//buttons
const btncreate = document.getElementById("btn-create");
const btnread = document.getElementById("btn-read");
const btnupdate = document.getElementById("btn-update");
const btndelete = document.getElementById("btn-delete");

//notfound
const notfound = document.getElementById("notfound");

// Global products array to store current data
let products = [];

//insert value using create button
btncreate.onclick = async event => {
  const productData = {
    name: proname.value,
    seller: seller.value,
    price: price.value
  };

  const result = await apiService.createProduct(productData);
  
  if(result.success) {
    proname.value = seller.value = price.value = "";
    await updateNextId();
    await table();
    
    let insertmsg = document.querySelector(".insertmsg");
    getMsg(true, insertmsg);
  } else {
    console.error("Create failed:", result.error);
    let insertmsg = document.querySelector(".insertmsg");
    getMsg(false, insertmsg);
  }
};

//create event on btn read button
btnread.onclick = async () => {
  await table();
};

//update event
btnupdate.onclick = async () => {
  const id = parseInt(userid.value || 0);
  if(id) {
    const productData = {
      name: proname.value,
      seller: seller.value,
      price: price.value
    };

    const result = await apiService.updateProduct(id, productData);
    
    if(result.success) {
      let updatemsg = document.querySelector(".updatemsg");
      getMsg(true, updatemsg);
      
      // Clear form fields
      proname.value = seller.value = price.value = "";
      
      // Update table and get next available ID
      await table();
      await updateNextId();
    } else {
      console.error("Update failed:", result.error);
      let updatemsg = document.querySelector(".updatemsg");
      getMsg(false, updatemsg);
    }
  }
};

//delete records
btndelete.onclick = async () => {
  const result = await apiService.deleteAllProducts();
  
  if(result.success) {
    products = [];
    await table();
    await updateNextId();

    let deletemsg = document.querySelector(".deletemsg");
    getMsg(true, deletemsg);
  } else {
    console.error("Delete all failed:", result.error);
    let deletemsg = document.querySelector(".deletemsg");
    getMsg(false, deletemsg);
  }
};

//window onload event
window.onload = async () => {
  await updateNextId();
  await table();
};

async function updateNextId() {
  const nextId = await apiService.getNextId();
  userid.value = nextId;
}

async function table() {
  const tbody = document.getElementById("tbody");

  while(tbody.hasChildNodes()) {
    tbody.removeChild(tbody.firstChild);
  }

  notfound.textContent = "";

  const result = await apiService.getAllProducts();
  
  if(result.success) {
    products = result.data;
    
    if(products.length > 0) {
      products.forEach(product => {
        createEle("tr", tbody, tr => {
          // ID column
          createEle("td", tr, td => {
            td.textContent = product.id;
          });
          
          // Name column
          createEle("td", tr, td => {
            td.textContent = product.name;
          });
          
          // Seller column
          createEle("td", tr, td => {
            td.textContent = product.seller;
          });
          
          // Price column
          createEle("td", tr, td => {
            td.textContent = `€ ${product.price}`;
          });
          
          // Edit column
          createEle("td", tr, td => {
            createEle("i", td, i => {
              i.className += "fas fa-edit btnedit";
              i.setAttribute('data-id', product.id);
              i.onclick = editbtn;
            });
          });
          
          // Delete column
          createEle("td", tr, td => {
            createEle("i", td, i => {
              i.className += "fas fa-trash-alt btndelete";
              i.setAttribute('data-id', product.id);
              i.onclick = deletebtn;
            });
          });
        });
      });
    } else {
      notfound.textContent = "No records found in the database...!";
    }
  } else {
    console.error("Failed to fetch products:", result.error);
    notfound.textContent = "Error loading products...!";
  }
}

async function editbtn(event) {
  let id = parseInt(event.target.dataset.id);
  
  const product = products.find(p => p.id === id);
  if(product) {
    userid.value = product.id || 0;
    proname.value = product.name || "";
    seller.value = product.seller || "";
    price.value = product.price || "";
  }
}

const deletebtn = async event => {
  let id = parseInt(event.target.dataset.id);
  
  const result = await apiService.deleteProduct(id);
  
  if(result.success) {
    await table();
    await updateNextId();
  } else {
    console.error("Delete failed:", result.error);
  }
};

//create dynamic elements
const createEle = (tagname, appendTo, fn) => {
  const element = document.createElement(tagname);
  if(appendTo) appendTo.appendChild(element);
  if(fn) fn(element);
};

function getMsg(flag, element) {
  if (flag) {
    element.className += " movedown";

    setTimeout(() => {
      element.classList.forEach(classname => {
        classname == "movedown" ? undefined : element.classList.remove("movedown");
      });
    }, 4000);
  }
}

