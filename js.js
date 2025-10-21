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

  // باز کردن مودال
  orderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    orderModal.style.display = "block";
  });

  // بستن مودال
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

    // چک کن اگر محصول قبلاً اضافه شده
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

    // دکمه +
    const plusBtn = document.createElement("button");
    plusBtn.innerText = "+";
    plusBtn.addEventListener("click", () => {
      item.quantity += 1;
      renderCart();
    });

    // دکمه -
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


  // نمایش فرم نهایی
  finishOrderBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    finishOrderDialog.style.display = "block";
    finalOrderList.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerText = `${item.name} - $${item.price}`;
      finalOrderList.appendChild(li);
    });
  });

 // دکمه Order نهایی
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
 // 🔹 اینجا console.log اضافه می‌کنیم
  console.log("ارسال به سرور:", { name, phone, address, city, country });

  try {
    // 1. ایجاد کاربر جدید
    const userRes = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: `${Date.now()}@test.com`, // یه ایمیل تستی یکتا
        phone
      })
    });

    if (!userRes.ok) throw new Error("Failed to create user");
    const userData = await userRes.json();
    const userId = userData.userId;

    // 2. ایجاد آدرس برای کاربر
    const addressRes = await fetch("http://localhost:3000/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        label: "خانه",
        line1: address,
        city: city || null,
        postal_code: null,
        country: country || null
      })
    });

    if (!addressRes.ok) throw new Error("Failed to create address");
    const addressData = await addressRes.json();
    const addressId = addressData.addressId;

    // 3. ثبت هر سفارش داخل cart
   for (const item of cart) {
  // بررسی مقادیر قبل از ارسال
  if (!item.name || item.quantity <= 0) {
    console.warn("محصول نامعتبر، رد شد:", item);
    continue; // رد کردن محصول نامعتبر
  }

  const orderRes = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      user_name: name,         // مطمئن شو همیشه مقدار دارد
      address_id: addressId,
      product_name: item.name,
      quantity: item.quantity
    })
  });

  // بررسی جواب سرور
  if (!orderRes.ok) {
    const errText = await orderRes.text();
    throw new Error("خطا در ثبت سفارش: " + errText);
  }
}

    // نمایش پیام تشکر
    finishOrderDialog.style.display = "none";
    orderModal.style.display = "none";
    thanksMessage.style.display = "block";

    // ریست کردن سبد
    cart = [];
    total = 0;
    listOfOrders.innerHTML = "";
    cartTotal.innerText = "0$";

    setTimeout(() => {
      thanksMessage.style.display = "none";
    }, 3000);

   } catch (err) {
    console.error("🔥 خطا در بخش ثبت سفارش:", err);
    alert("خطا در ثبت سفارش! لطفاً کنسول را چک کنید (F12).");
  }

});
});


// دکمه موبایل و منوی تب‌ها
const mobileTabBtn = document.getElementById('mobileTabBtn');
const mobileTabs = document.getElementById('mobileTabs');

mobileTabBtn.addEventListener('click', () => {
  mobileTabs.classList.toggle('show');
});

// تغییر tab content هنگام کلیک روی منوی موبایل
mobileTabs.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget.getAttribute('data-bs-target');

    // پنهان کردن همه tab-pane ها
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('show', 'active');
    });

    // فعال کردن tab-pane انتخاب شده
    const pane = document.querySelector(target);
    pane.classList.add('show', 'active');

    // بستن منوی موبایل
    mobileTabs.classList.remove('show');

    // آپدیت کلاس active روی دکمه‌ها
    mobileTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});



