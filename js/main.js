// main.js — UI logic
const apiService = window.apiService;

const userid = document.getElementById("userid");
const proname = document.getElementById("proname");
const seller = document.getElementById("seller");
const price = document.getElementById("price");
const btncreate = document.getElementById("btn-create");
const btnread = document.getElementById("btn-read");
const btnupdate = document.getElementById("btn-update");
const btndelete = document.getElementById("btn-delete");
const notfound = document.getElementById("notfound");
const tbody = document.getElementById("tbody");

let products = [];

// Load next ID on startup
window.onload = async () => {
  await updateNextId();
  await loadTable();
};

// CREATE
btncreate.onclick = async () => {
  const obj = {
    name: proname.value,
    seller: seller.value,
    price: price.value,
  };

  const result = await apiService.createProduct(obj);
  if (result.success) {
    showMsg(".insertmsg");
    clearInputs();
    await updateNextId();
    await loadTable();
  }
};

// READ
btnread.onclick = async () => {
  await loadTable();
};

// UPDATE
btnupdate.onclick = async () => {
  const id = parseInt(userid.value);
  if (!id) return;

  const data = {
    name: proname.value,
    seller: seller.value,
    price: price.value,
  };

  const result = await apiService.updateProduct(id, data);
  if (result.success) {
    showMsg(".updatemsg");
    clearInputs();
    await updateNextId();
    await loadTable();
  }
};

// DELETE ALL
btndelete.onclick = async () => {
  await apiService.deleteAllProducts();
  showMsg(".deletemsg");
  await updateNextId();
  await loadTable();
};

// Update next ID
async function updateNextId() {
  const result = await apiService.getNextId();
  userid.value = result.data.nextId;
}

// Load table data
async function loadTable() {
  tbody.innerHTML = "";

  const result = await apiService.getAllProducts();

  if (!result.success || result.data.length === 0) {
    notfound.textContent = "No records found!";
    return;
  }

  notfound.textContent = "";
  products = result.data;

  products.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.seller}</td>
      <td>€ ${p.price}</td>
      <td><i class="fas fa-edit btnedit" data-id="${p.id}"></i></td>
      <td><i class="fas fa-trash-alt btndelete" data-id="${p.id}"></i></td>
    `;

    tbody.appendChild(tr);
  });

  // Edit button
  document.querySelectorAll(".btnedit").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const p = products.find((x) => x.id == id);

      userid.value = p.id;
      proname.value = p.name;
      seller.value = p.seller;
      price.value = p.price;
    };
  });

  // Delete button
  document.querySelectorAll(".btndelete").forEach((btn) => {
    btn.onclick = async () => {
      await apiService.deleteProduct(btn.dataset.id);
      await updateNextId();
      await loadTable();
    };
  });
}

function clearInputs() {
  proname.value = "";
  seller.value = "";
  price.value = "";
}

function showMsg(selector) {
  const el = document.querySelector(selector);
  el.classList.add("movedown");
  setTimeout(() => el.classList.remove("movedown"), 3000);
}
