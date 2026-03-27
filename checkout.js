// Checkout Logic
document.addEventListener("DOMContentLoaded", function () {
  initCheckout();
});

function initCheckout() {
  // Initialize EmailJS
  emailjs.init("TYeh6YhrHgHX2-_8M");

  var cart = getFromStorage("gpu_cart");

  // Redirect if cart is empty
  if (cart.length === 0) {
    alert("Your cart is empty");
    window.location.href = "index.html";
    return;
  }

  renderOrderSummary(cart);

  // Handle Shipping Form Submit
  var shippingForm = document.getElementById("shippingForm");
  if (shippingForm) {
    shippingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate (basic HTML5 validation handles empty fields)

      // Move to payment step
      document.getElementById("shippingSection").classList.add("d-none");
      document.getElementById("paymentSection").classList.remove("d-none");

      // Update Steps
      document.getElementById("stepProgress").style.width = "50%";
      document.getElementById("step2Indicator").classList.add("active");
      document.getElementById("step1Indicator").classList.add("completed");

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Handle Payment Form Submit
  var paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simulate Payment Processing
      var btn = this.querySelector('button[type="submit"]');
      var originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

      setTimeout(function () {
        // Generate Order ID
        var orderId = "GPU-" + Math.floor(10000 + Math.random() * 90000);

        // Collect Customer Details from Shipping Form
        var shippingForm = document.getElementById("shippingForm");
        var formData = new FormData(shippingForm);
        var customerName =
          formData.get("firstName") + " " + formData.get("lastName");
        var customerEmail = formData.get("email");

        // Get Payment Method
        var paymentMethod = document.querySelector(
          'input[name="paymentOption"]:checked',
        ).value;
        var paymentLabel =
          paymentMethod === "cod"
            ? "Cash on Delivery"
            : paymentMethod === "upi"
              ? "UPI"
              : "Credit/Debit Card";

        // Prepare Email Content
        var cart = getFromStorage("gpu_cart");
        var orderItems = cart
          .map(
            (item) =>
              `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`,
          )
          .join("\n");
        var totalAmount = document.getElementById("summaryTotal").textContent;

        var emailMessage =
          `Order Confirmation #${orderId}\n\n` +
          `Dear ${customerName},\n\n` +
          `Thank you for your order! Here are your order details:\n\n` +
          `Items:\n${orderItems}\n\n` +
          `Total Amount: ${totalAmount}\n` +
          `Payment Method: ${paymentLabel}\n\n` +
          `Shipping Address:\n${formData.get("address")}, ${formData.get("city")}, ${formData.get("state")} - ${formData.get("zip")}\n\n` +
          `We will notify you once your order is shipped.\n\n` +
          `Best regards,\nGeForce Store Team`;

        var templateParams = {
          to_name: customerName,
          to_email: customerEmail,
          email: customerEmail,
          customer_email: customerEmail,
          recipient: customerEmail,
          from_name: "GeForce Store Team",
          from_email: customerEmail, // Crucial for Auto-Reply to work
          order_number: orderId,
          subject: `Order Confirmation #${orderId}`,
          message: emailMessage,
          reply_to: "support@gpustore.com",
        };

        var serviceID = "service_p0vfe2s";
        var templateID = "template_akn32hv"; // New Checkout Template

        // Send Email
        emailjs
          .send(serviceID, templateID, templateParams)
          .then(
            function () {
              console.log("Order email sent successfully");
            },
            function (error) {
              console.error("Order email failed:", error);
            },
          )
          .finally(function () {
            // Success UI
            document.getElementById("orderNumber").textContent = "#" + orderId;

            // Clear Cart
            localStorage.removeItem("gpu_cart");

            // Show Success Modal
            var successModal = new bootstrap.Modal(
              document.getElementById("successModal"),
            );
            successModal.show();

            // Update Steps
            document.getElementById("stepProgress").style.width = "100%";
            document.getElementById("step3Indicator").classList.add("active");
            document
              .getElementById("step2Indicator")
              .classList.add("completed");
          });
      }, 2000);
    });
  }

  // Card Input Formatting
  var cardInput = document.getElementById("cardNumber");
  if (cardInput) {
    cardInput.addEventListener("input", function (e) {
      var value = e.target.value.replace(/\D/g, "");
      var formatted = "";
      for (var i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += value[i];
      }
      e.target.value = formatted;
    });
  }

  var expiryInput = document.getElementById("cardExpiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", function (e) {
      var value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        e.target.value = value.substring(0, 2) + "/" + value.substring(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }
}

function renderOrderSummary(cart) {
  var container = document.getElementById("orderSummaryItems");
  if (!container) return;

  var html = "";
  var subtotal = 0;

  cart.forEach(function (item) {
    var itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    var imgName = getImageName(item.image);

    html += `
        <div class="order-summary-item">
            <div class="d-flex align-items-center">
                <div style="width: 50px; height: 50px; background: #2a2a2a; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 15px;">
                    <img src="${imgName}" alt="${item.name}" style="max-width: 100%; max-height: 100%;">
                </div>
                <div>
                    <h6 class="mb-0 text-white" style="font-size: 0.9rem;">${item.name}</h6>
                    <small class="text-muted">Qty: ${item.quantity}</small>
                </div>
            </div>
            <div class="text-end">
                <div class="fw-bold">₹${itemTotal.toLocaleString()}</div>
            </div>
        </div>
        `;
  });

  container.innerHTML = html;

  var tax = subtotal * 0.18;
  var total = subtotal + tax;

  document.getElementById("summarySubtotal").textContent =
    "₹" + subtotal.toLocaleString();
  document.getElementById("summaryTax").textContent =
    "₹" + tax.toLocaleString(undefined, { maximumFractionDigits: 0 });
  document.getElementById("summaryTotal").textContent =
    "₹" + total.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function getFromStorage(key) {
  try {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getImageName(imagePath) {
  if (!imagePath) return "";
  var parts = imagePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1];
}
