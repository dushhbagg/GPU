// GeForce Store - Complete Website Functionality
(function () {
  "use strict";

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // === STATE ===
    var cart = getFromStorage("gpu_cart");
    var wishlist = getFromStorage("gpu_wishlist");

    // === DOM ELEMENTS ===
    var cartSidebar = document.getElementById("cartSidebar");
    var wishlistSidebar = document.getElementById("wishlistSidebar");
    var cartOverlay = document.getElementById("cartOverlay");
    var wishlistOverlay = document.getElementById("wishlistOverlay");
    var cartItemsContainer = document.getElementById("cartItems");
    var wishlistItemsContainer = document.getElementById("wishlistItems");
    var cartTotalElement = document.getElementById("cartTotal");
    var backToTopBtn = document.getElementById("backToTop");
    var navbar = document.querySelector(".navbar");

    // === INITIALIZE ===
    updateBadges();
    initNavbarScroll();
    initBackToTop();
    initSmoothScroll();
    initProductCards();
    initSearch();
    initContactForm();
    initNewsletterForm();
    initAccountDropdown();
    initScrollAnimations();

    // === CART BUTTONS ===
    var cartButtons = document.querySelectorAll(".add-to-cart-btn");
    for (var i = 0; i < cartButtons.length; i++) {
      cartButtons[i].onclick = function (e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var card = btn.closest(".product-card");
        var img = card ? card.querySelector("img") : null;

        var product = {
          id: btn.getAttribute("data-id"),
          name: btn.getAttribute("data-name"),
          price: parseInt(btn.getAttribute("data-price")),
          image: img ? img.src : "",
          quantity: 1,
        };

        addToCart(product);

        // Button animation
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
        btn.classList.add("btn-success");
        btn.classList.remove("btn-primary");

        setTimeout(function () {
          btn.innerHTML =
            '<i class="fas fa-shopping-cart me-2"></i>Add to Cart';
          btn.classList.remove("btn-success");
          btn.classList.add("btn-primary");
        }, 2000);
      };
    }

    // === WISHLIST BUTTONS ===
    var wishlistButtons = document.querySelectorAll(".add-to-wishlist-btn");
    for (var j = 0; j < wishlistButtons.length; j++) {
      wishlistButtons[j].onclick = function (e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var card = btn.closest(".product-card");
        var img = card ? card.querySelector("img") : null;

        var product = {
          id: btn.getAttribute("data-id"),
          name: btn.getAttribute("data-name"),
          price: parseInt(btn.getAttribute("data-price")),
          image: img ? img.src : "",
        };

        addToWishlist(product);

        // Heart animation
        var icon = btn.querySelector("i");
        if (icon) {
          icon.classList.remove("far");
          icon.classList.add("fas");
          icon.style.color = "#dc3545";
        }
      };
    }

    // === NAV ICON CLICKS ===
    var cartIcon = document.querySelector('.nav-icon[title="Cart"]');
    if (cartIcon) {
      cartIcon.onclick = function (e) {
        e.preventDefault();
        openCart();
      };
    }

    var wishlistIcon = document.querySelector('.nav-icon[title="Wishlist"]');
    if (wishlistIcon) {
      wishlistIcon.onclick = function (e) {
        e.preventDefault();
        openWishlist();
      };
    }
    // Removed old account logic (moved to dropdown)
    // === CLOSE BUTTONS ===
    var closeCartBtn = document.getElementById("closeCart");
    if (closeCartBtn) {
      closeCartBtn.onclick = closeCart;
    }

    var closeWishlistBtn = document.getElementById("closeWishlist");
    if (closeWishlistBtn) {
      closeWishlistBtn.onclick = closeWishlist;
    }

    // === OVERLAY CLICKS ===
    if (cartOverlay) {
      cartOverlay.onclick = closeCart;
    }
    if (wishlistOverlay) {
      wishlistOverlay.onclick = closeWishlist;
    }

    // === CLEAR BUTTONS ===
    var clearCartBtn = document.getElementById("clearCart");
    if (clearCartBtn) {
      clearCartBtn.onclick = function () {
        if (confirm("Clear your cart?")) {
          cart = [];
          saveToStorage("gpu_cart", cart);
          updateBadges();
          renderCart();
          showNotification("Cart Cleared", "info");
        }
      };
    }

    var clearWishlistBtn = document.getElementById("clearWishlist");
    if (clearWishlistBtn) {
      clearWishlistBtn.onclick = function () {
        if (confirm("Clear your wishlist?")) {
          wishlist = [];
          saveToStorage("gpu_wishlist", wishlist);
          updateBadges();
          renderWishlist();
          showNotification("Wishlist Cleared", "info");
        }
      };
    }

    // === CHECKOUT BUTTON ===
    var checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.onclick = function () {
        if (cart.length === 0) {
          showNotification("Your cart is empty!", "warning");
          return;
        }

        var userLoggedIn = localStorage.getItem("gpu_user_logged_in");
        if (!userLoggedIn) {
          showNotification("Please log in to proceed to checkout.", "warning");
          sessionStorage.setItem("login_redirect", "checkout.html");
          setTimeout(function () {
            window.location.href = "login.html";
          }, 1500);
          return;
        }

        showNotification("Redirecting to checkout...", "success");

        setTimeout(function () {
          window.location.href = "checkout.html";
        }, 500);
      };
    }

    // ================================
    // CART FUNCTIONS
    // ================================

    function addToCart(product) {
      var found = false;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
          cart[i].quantity++;
          found = true;
          break;
        }
      }

      if (!found) {
        cart.push(product);
      }

      saveToStorage("gpu_cart", cart);
      updateBadges();
      renderCart();
      openCart();
      showNotification(product.name + " added to cart!", "success");
    }

    function openCart() {
      closeWishlist();
      if (cartSidebar) cartSidebar.classList.add("open");
      if (cartOverlay) cartOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
      renderCart();
    }

    function closeCart() {
      if (cartSidebar) cartSidebar.classList.remove("open");
      if (cartOverlay) cartOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    function renderCart() {
      if (!cartItemsContainer) return;

      if (cart.length === 0) {
        cartItemsContainer.innerHTML =
          '<div class="cart-empty-state">' +
          '<i class="fas fa-shopping-cart"></i>' +
          "<h5>Your cart is empty</h5>" +
          "<p>Add some amazing GPUs to get started!</p>" +
          '<button class="btn btn-primary" onclick="document.getElementById(\'closeCart\').click()">Start Shopping</button>' +
          "</div>";
        if (cartTotalElement) cartTotalElement.textContent = "₹0";
        return;
      }

      var html = "";
      var total = 0;

      for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var itemTotal = item.price * item.quantity;
        total += itemTotal;
        var imgName = getImageName(item.image);

        html += '<div class="cart-item" data-id="' + item.id + '">';
        html +=
          '<div class="cart-item-image"><img src="' +
          imgName +
          '" alt="' +
          item.name +
          '"></div>';
        html += '<div class="cart-item-details">';
        html += '<h5 class="cart-item-title">' + item.name + "</h5>";
        html +=
          '<div class="cart-item-price">₹' +
          item.price.toLocaleString() +
          "</div>";
        html +=
          '<div class="cart-item-subtotal">Subtotal: ₹' +
          itemTotal.toLocaleString() +
          "</div>";
        html += '<div class="cart-item-controls">';
        html += '<div class="cart-quantity-controls">';
        html +=
          '<button class="qty-btn decrease" data-id="' +
          item.id +
          '">−</button>';
        html += '<span class="cart-qty">' + item.quantity + "</span>";
        html +=
          '<button class="qty-btn increase" data-id="' +
          item.id +
          '">+</button>';
        html += "</div>";
        html +=
          '<button class="remove-item" data-id="' +
          item.id +
          '"><i class="fas fa-trash"></i> Remove</button>';
        html += "</div></div></div>";
      }

      cartItemsContainer.innerHTML = html;
      if (cartTotalElement)
        cartTotalElement.textContent = "₹" + total.toLocaleString();

      // Attach event listeners
      var decreaseBtns =
        cartItemsContainer.querySelectorAll(".qty-btn.decrease");
      for (var j = 0; j < decreaseBtns.length; j++) {
        decreaseBtns[j].onclick = function () {
          updateQuantity(this.getAttribute("data-id"), -1);
        };
      }

      var increaseBtns =
        cartItemsContainer.querySelectorAll(".qty-btn.increase");
      for (var k = 0; k < increaseBtns.length; k++) {
        increaseBtns[k].onclick = function () {
          updateQuantity(this.getAttribute("data-id"), 1);
        };
      }

      var removeBtns = cartItemsContainer.querySelectorAll(".remove-item");
      for (var l = 0; l < removeBtns.length; l++) {
        removeBtns[l].onclick = function () {
          removeFromCart(this.getAttribute("data-id"));
        };
      }
    }

    function updateQuantity(id, change) {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
          cart[i].quantity += change;
          if (cart[i].quantity <= 0) {
            cart.splice(i, 1);
          }
          break;
        }
      }
      saveToStorage("gpu_cart", cart);
      updateBadges();
      renderCart();
    }

    function removeFromCart(id) {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
          var removedItem = cart[i].name;
          cart.splice(i, 1);
          showNotification(removedItem + " removed from cart", "info");
          break;
        }
      }
      saveToStorage("gpu_cart", cart);
      updateBadges();
      renderCart();
    }

    // ================================
    // WISHLIST FUNCTIONS
    // ================================

    function addToWishlist(product) {
      for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === product.id) {
          showNotification(
            product.name + " is already in wishlist!",
            "warning",
          );
          openWishlist();
          return;
        }
      }

      wishlist.push(product);
      saveToStorage("gpu_wishlist", wishlist);
      updateBadges();
      renderWishlist();
      openWishlist();
      showNotification(product.name + " added to wishlist!", "success");
    }

    function openWishlist() {
      closeCart();
      if (wishlistSidebar) wishlistSidebar.classList.add("open");
      if (wishlistOverlay) wishlistOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
      renderWishlist();
    }

    function closeWishlist() {
      if (wishlistSidebar) wishlistSidebar.classList.remove("open");
      if (wishlistOverlay) wishlistOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    function renderWishlist() {
      if (!wishlistItemsContainer) return;

      if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML =
          '<div class="cart-empty-state">' +
          '<i class="far fa-heart"></i>' +
          "<h5>Your wishlist is empty</h5>" +
          "<p>Save your favorite GPUs here!</p>" +
          '<button class="btn btn-primary" onclick="document.getElementById(\'closeWishlist\').click()">Browse Products</button>' +
          "</div>";
        return;
      }

      var html = "";

      for (var i = 0; i < wishlist.length; i++) {
        var item = wishlist[i];
        var imgName = getImageName(item.image);

        html += '<div class="cart-item">';
        html +=
          '<div class="cart-item-image"><img src="' +
          imgName +
          '" alt="' +
          item.name +
          '"></div>';
        html += '<div class="cart-item-details">';
        html += '<h5 class="cart-item-title">' + item.name + "</h5>";
        html +=
          '<div class="cart-item-price">₹' +
          item.price.toLocaleString() +
          "</div>";
        html += '<div class="cart-item-controls">';
        html +=
          '<button class="btn btn-sm btn-primary move-to-cart" data-id="' +
          item.id +
          '"><i class="fas fa-shopping-cart me-1"></i>Add to Cart</button>';
        html +=
          '<button class="remove-item" data-id="' +
          item.id +
          '"><i class="fas fa-trash"></i></button>';
        html += "</div></div></div>";
      }

      wishlistItemsContainer.innerHTML = html;

      // Attach event listeners
      var moveBtns = wishlistItemsContainer.querySelectorAll(".move-to-cart");
      for (var j = 0; j < moveBtns.length; j++) {
        moveBtns[j].onclick = function () {
          moveToCart(this.getAttribute("data-id"));
        };
      }

      var removeBtns = wishlistItemsContainer.querySelectorAll(".remove-item");
      for (var k = 0; k < removeBtns.length; k++) {
        removeBtns[k].onclick = function () {
          removeFromWishlist(this.getAttribute("data-id"));
        };
      }
    }

    function moveToCart(id) {
      for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === id) {
          var item = wishlist[i];
          item.quantity = 1;
          addToCart(item);
          removeFromWishlist(id);
          break;
        }
      }
    }

    function removeFromWishlist(id) {
      for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === id) {
          wishlist.splice(i, 1);
          break;
        }
      }
      saveToStorage("gpu_wishlist", wishlist);
      updateBadges();
      renderWishlist();
    }

    // ================================
    // UI FUNCTIONS
    // ================================

    function updateBadges() {
      var cartCount = 0;
      for (var i = 0; i < cart.length; i++) {
        cartCount += cart[i].quantity;
      }

      var cartBadges = document.querySelectorAll(
        '.nav-icon[title="Cart"] .badge',
      );
      for (var j = 0; j < cartBadges.length; j++) {
        cartBadges[j].textContent = cartCount;
        cartBadges[j].style.display = cartCount > 0 ? "flex" : "none";
      }

      var wishlistBadges = document.querySelectorAll(
        '.nav-icon[title="Wishlist"] .badge',
      );
      for (var k = 0; k < wishlistBadges.length; k++) {
        wishlistBadges[k].textContent = wishlist.length;
        wishlistBadges[k].style.display = wishlist.length > 0 ? "flex" : "none";
      }
    }

    function initNavbarScroll() {
      if (!navbar) return;

      window.addEventListener("scroll", function () {
        if (window.scrollY > 100) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      });
    }

    function initBackToTop() {
      if (!backToTopBtn) return;

      window.addEventListener("scroll", function () {
        if (window.scrollY > 500) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      });

      backToTopBtn.onclick = function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      };
    }

    function initSmoothScroll() {
      var links = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
          var href = this.getAttribute("href");
          if (href === "#") return;

          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            var offset = navbar ? navbar.offsetHeight : 0;
            var top =
              target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
              top: top,
              behavior: "smooth",
            });

            // Close mobile menu
            var navCollapse = document.querySelector(".navbar-collapse");
            if (navCollapse && navCollapse.classList.contains("show")) {
              var toggler = document.querySelector(".navbar-toggler");
              if (toggler) toggler.click();
            }
          }
        });
      }
    }

    function initProductCards() {
      var cards = document.querySelectorAll(".product-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("mouseenter", function () {
          this.style.transform = "translateY(-10px)";
        });
        cards[i].addEventListener("mouseleave", function () {
          this.style.transform = "translateY(0)";
        });
      }
    }

    function initAccountDropdown() {
      const isLoggedIn = localStorage.getItem("gpu_user_logged_in") === "true";
      const userEmail = localStorage.getItem("gpu_user_email");
      const dropdownMenu = document.getElementById("accountDropdownMenu");

      let usersList = JSON.parse(localStorage.getItem('gpu_users_data')) || {};
      let userData = usersList[userEmail] || {};
      let userName = userData.name || userEmail || "User";

      if (isLoggedIn && dropdownMenu) {
        let navIcon = document.querySelector('.nav-icon[title="Account"] i');
        if (navIcon) navIcon.style.color = '#76b900';
        dropdownMenu.innerHTML = `
          <li><h6 class="dropdown-header text-white" style="font-size: 0.9rem;">Signed in as<br/><strong style="color: #76b900;">${userName}</strong></h6></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="settings.html"><i class="fas fa-cog me-2"></i> Settings & Profile</a></li>
          <li><a class="dropdown-item text-danger mt-2" href="#" onclick="handleGlobalLogout(event)"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
        `;
      } else if (dropdownMenu) {
        dropdownMenu.innerHTML = `
          <li><h6 class="dropdown-header" style="font-size: 0.9rem;">You are not logged in</h6></li>
          <li><a class="dropdown-item text-success mt-2" href="login.html" style="font-weight: 600;"><i class="fas fa-sign-in-alt me-2"></i> Sign In / Register</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="settings.html"><i class="fas fa-sliders-h me-2"></i> Guest Preferences</a></li>
        `;
      }
    }

    // Expose global logout explicitly since inline onclick needs global scope
    window.handleGlobalLogout = function (e) {
      if (e) e.preventDefault();
      localStorage.removeItem("gpu_user_logged_in");
      localStorage.removeItem("gpu_user_email");
      window.location.reload();
    };

    function initScrollAnimations() {
      // Add animate class dynamically if missed in HTML
      var cards = document.querySelectorAll('.product-card, .feature-card, .review-card, .trust-item');
      cards.forEach(card => card.classList.add('fade-up'));

      var observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.fade-up, .fade-in, .scale-in').forEach(el => observer.observe(el));
    }

    function initSearch() {
      var searchInput = document.querySelector(".search-box input");
      if (!searchInput) return;

      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var query = this.value.trim().toLowerCase();

          if (query.length < 2) {
            showNotification("Please enter at least 2 characters", "warning");
            return;
          }

          // Search through products
          var products = document.querySelectorAll(".product-card");
          var found = false;

          for (var i = 0; i < products.length; i++) {
            var title = products[i].querySelector(".product-title");
            if (title && title.textContent.toLowerCase().includes(query)) {
              products[i].scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              products[i].style.animation = "pulse 1s ease";
              setTimeout(function () {
                products[i].style.animation = "";
              }, 1000);
              found = true;
              break;
            }
          }

          if (!found) {
            showNotification(
              'No products found for "' + query + '"',
              "warning",
            );
          }

          this.value = "";
        }
      });
    }

    function initContactForm() {
      var form = document.querySelector(".contact-section form");
      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var message = document.getElementById("message").value;

        if (!name || !email || !message) {
          showNotification("Please fill in all required fields", "warning");
          return;
        }

        var subjectVal = document.getElementById("subject").value;
        var order = document.getElementById("order").value;

        var body = "Name: " + name + "\n";
        body += "Email: " + email + "\n";
        if (order) body += "Order Number: " + order + "\n";
        body += "Subject: " + subjectVal + "\n\n";
        body += "Message:\n" + message;

        // Send email using EmailJS
        // You need to replace these with your actual Service ID and Template ID
        // from https://dashboard.emailjs.com/

        var templateParams = {
          from_name: name,
          from_email: email,
          order_number: order || "N/A",
          subject: subjectVal,
          message: message,
        };

        var serviceID = "service_p0vfe2s";
        var templateID = "template_lm5f6h7";
        var publicKey = "TYeh6YhrHgHX2-_8M";

        // Initialize EmailJS immediately before sending
        try {
          emailjs.init(publicKey);
        } catch (initError) {
          console.error("EmailJS Init Error:", initError);
          showNotification(
            "Error initializing email service: " + initError.message,
            "error",
          );
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            '<i class="fas fa-paper-plane me-2"></i>Send Message';
          return;
        }

        emailjs.send(serviceID, templateID, templateParams).then(
          function () {
            showNotification("Message sent successfully!", "success");
            form.reset();
            submitBtn.innerHTML =
              '<i class="fas fa-paper-plane me-2"></i>Send Message';
            submitBtn.disabled = false;
          },
          function (error) {
            console.error("FAILED...", error);
            // Show the specific error message from EmailJS
            var errorMsg = error.text || error.message || JSON.stringify(error);
            showNotification("Failed: " + errorMsg, "error");
            submitBtn.innerHTML =
              '<i class="fas fa-paper-plane me-2"></i>Send Message';
            submitBtn.disabled = false;

            // Fallback to mailto
            setTimeout(function () {
              if (
                confirm("Automatic sending failed. Open email client instead?")
              ) {
                var mailtoLink =
                  "mailto:support@geforce-store.com" +
                  "?subject=" +
                  encodeURIComponent("[GeForce Store Support] " + subjectVal) +
                  "&body=" +
                  encodeURIComponent(body);
                window.location.href = mailtoLink;
              }
            }, 1000);
          },
        );
      });
    }

    function initNewsletterForm() {
      var form = document.querySelector(".newsletter-form");
      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]');

        if (!email || !email.value) {
          showNotification("Please enter your email", "warning");
          return;
        }

        showNotification("Thank you for subscribing!", "success");
        email.value = "";
      });
    }

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    function getFromStorage(key) {
      try {
        var data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    function saveToStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Storage error:", e);
      }
    }

    function getImageName(imagePath) {
      if (!imagePath) return "";
      var parts = imagePath.replace(/\\/g, "/").split("/");
      return parts[parts.length - 1];
    }

    function showNotification(message, type) {
      type = type || "success";

      var container = document.querySelector(".toast-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
      }

      var icons = {
        success: "fa-check-circle",
        warning: "fa-exclamation-circle",
        error: "fa-times-circle",
        info: "fa-info-circle",
      };

      var colors = {
        success: "#76b900",
        warning: "#ffc107",
        error: "#dc3545",
        info: "#17a2b8",
      };

      var toast = document.createElement("div");
      toast.className = "toast-notification toast-" + type;
      toast.innerHTML =
        '<div class="toast-icon" style="color: ' +
        colors[type] +
        '">' +
        '<i class="fas ' +
        icons[type] +
        '"></i>' +
        "</div>" +
        '<div class="toast-content">' +
        '<div class="toast-message">' +
        message +
        "</div>" +
        "</div>" +
        '<button class="toast-close">' +
        '<i class="fas fa-times"></i>' +
        "</button>";

      container.appendChild(toast);

      setTimeout(function () {
        toast.classList.add("show");
      }, 10);

      toast.querySelector(".toast-close").onclick = function () {
        toast.classList.remove("show");
        setTimeout(function () {
          toast.remove();
        }, 300);
      };

      setTimeout(function () {
        if (document.body.contains(toast)) {
          toast.classList.remove("show");
          setTimeout(function () {
            toast.remove();
          }, 300);
        }
      }, 4000);
    }

    // ================================
    // KEYBOARD SHORTCUTS
    // ================================

    document.addEventListener("keydown", function (e) {
      // ESC to close sidebars
      if (e.key === "Escape") {
        closeCart();
        closeWishlist();
      }
    });
  }
})();
