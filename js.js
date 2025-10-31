document.addEventListener("DOMContentLoaded", () => {
  const orderBtn = document.getElementById("onlineOrderBtn");
  const orderModal = document.getElementById("onlineOrderModal");
  const closeModal = document.querySelector(".close-modal");
  const addToCartButtons = document.querySelectorAll(".addToCart");
  const listOfOrders = document.getElementById("listOfOrders");
  const cartTotal = document.getElementById("cartTotal");
  const finishOrderBtn = document.querySelector(".finishOrder");
  const finishOrderDialog = document.getElementById("finishOrderDialog");
  const finalOrderList = document.getElementById("finalOrderList");
  const orderBtnFinal = document.querySelector("#finishOrderDialog .order");
  const thanksMessage = document.getElementById("thanksMessage");

  let cart = [];
  let total = 0;

  // open modal
  orderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    orderModal.style.display = "block";
  });

  // close modal
  closeModal.addEventListener("click", () => {
    orderModal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === orderModal) orderModal.style.display = "none";
  });

 addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const recipe = btn.closest(".recipe");
    const name = recipe.querySelector(".name").innerText;
    const price = parseFloat(recipe.querySelector(".price").innerText.replace('$',''));

    // check if product existing
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    renderCart();
  });
});
function renderCart() {
  listOfOrders.innerHTML = "";
  total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const li = document.createElement("li");
    li.innerText = `${item.name} - $${item.price} x ${item.quantity}`;

    // button +
    const plusBtn = document.createElement("button");
    plusBtn.innerText = "+";
    plusBtn.addEventListener("click", () => {
      item.quantity += 1;
      renderCart();
    });

    // button -
    const minusBtn = document.createElement("button");
    minusBtn.innerText = "-";
    minusBtn.addEventListener("click", () => {
      item.quantity -= 1;
      if (item.quantity <= 0) cart.splice(index, 1);
      renderCart();
    });

    li.appendChild(minusBtn);
    li.appendChild(plusBtn);
    listOfOrders.appendChild(li);
  });

  cartTotal.innerText = `$${total}`;
}


  // show the order form
  finishOrderBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    finishOrderDialog.style.display = "block";
    finalOrderList.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerText = `${item.name} - $${item.price}`;
      finalOrderList.appendChild(li);
    });
      finishOrderDialog.scrollIntoView({ behavior: "smooth", block: "start" });

  });

 // submit order
orderBtnFinal.addEventListener("click", async () => {
  const name = document.getElementById("buyerName").value.trim();
  const phone = document.getElementById("buyerNumber").value.trim();
  const address = document.getElementById("buyerAddress").value.trim();
const city = document.getElementById("buyerCity").value.trim();
const country = document.getElementById("buyerCountry").value.trim();
  if (!name || !phone || !address || !city || !country) {
    alert("Please fill in all fields!");
    return;
  }
  console.log("send to the server:", { name, phone, address, city, country });

  try {
    // 1.make new
    const userRes = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: `${Date.now()}@test.com`, //test email
        phone
      })
    });

    if (!userRes.ok) throw new Error("Failed to create user");
    const userData = await userRes.json();
    const userId = userData.userId;

    // 2.make address for user
    const addressRes = await fetch("http://localhost:3000/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        label: "home",
        line1: address,
        city: city || null,
        postal_code: null,
        country: country || null
      })
    });

    if (!addressRes.ok) throw new Error("Failed to create address");
    const addressData = await addressRes.json();
    const addressId = addressData.addressId;

    // 3.submit item in cart
   for (const item of cart) {
  if (!item.name || item.quantity <= 0) {
    console.warn("Invalid product, skipped", item);
    continue;
  }

  const orderRes = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      user_name: name,       
      address_id: addressId,
      product_name: item.name,
      quantity: item.quantity
    })
  });

// Check server response
  if (!orderRes.ok) {
    const errText = await orderRes.text();
    throw new Error("خطا در ثبت سفارش: " + errText);
  }
}

// Show thank you message with nice effect
finishOrderDialog.style.display = "none";
orderModal.style.display = "none";

// Display message
thanksMessage.style.display = "block";
thanksMessage.classList.add("show");

// Reset cart
cart = [];
total = 0;
listOfOrders.innerHTML = "";
cartTotal.innerText = "0$";

// After 4 seconds, hide the message
setTimeout(() => {
  thanksMessage.classList.remove("show");

  // After animation ends (500ms), completely hide it
  setTimeout(() => {
    thanksMessage.style.display = "none";
  }, 500);
}, 4000);


   } catch (err) {
    console.error("🔥 Error in order section:", err);
    alert("Error placing order! Please check the console (F12).");
  }

});
});


// Mobile button and tab menu
const mobileTabBtn = document.getElementById('mobileTabBtn');
const mobileTabs = document.getElementById('mobileTabs');

mobileTabBtn.addEventListener('click', () => {
  mobileTabs.classList.toggle('show');
});

// Change tab content when clicking mobile menu
mobileTabs.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget.getAttribute('data-bs-target');

    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('show', 'active');
    });

    // Activate the selected tab pane
    const pane = document.querySelector(target);
    pane.classList.add('show', 'active');

    // Close mobile menu
    mobileTabs.classList.remove('show');

    // Update active class on buttons
    mobileTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});



