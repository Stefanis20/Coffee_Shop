// Elements to render
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const totalPriceEl = document.querySelector(".total-price");
const subtotalEl = document.querySelector(".subtotal");
const tipEl = document.querySelector(".tip");
const totalItemsEl = document.querySelector(".total-items");
const changeEl = document.querySelector(".change");

// Cart array
let cart = [];
let totalPrice = 0;

// Function - Render Products
function renderProducts() {
    const categoriesRendered = new Set();
    productsEl.innerHTML = ""; // Καθαρίζουμε το περιεχόμενο πριν ξεκινήσει το render

    products.forEach((product) => {
        if (!categoriesRendered.has(product.category)) {
            categoriesRendered.add(product.category);
            productsEl.innerHTML += `<h2 class="category-title ${product.category}">${product.category}</h2>`;
        }

        productsEl.innerHTML += `
        <div class="row main align-items-center">
            <div class="col">
                <img class="img-fluid" src="${product.imgSrc}" alt="${product.name}">
            </div>
            <div class="col"> 
                <a href="#" class="add-to-cart" onClick="addToCart(${product.id})"> 
                    <i class="fas fa-plus"></i>
                </a>
            </div>
            <div class="col">
                <div class="row">${product.name}</div>
            </div>
            <div class="col">
                &euro; ${product.price}
            </div>
        </div>`;
    });
}

renderProducts();

// Function to add item to cart
function addToCart(id) {
    if (cart.some((item) => item.id === id)) {
        changeNumberOfUnits('plus', id);
    } else {
        const item = products.find((product) => product.id === id);
        cart.push({
            ...item,
            numberOfUnits: 1,
        });
    }
    updateCart();
}

// Update cart
function updateCart() {
    renderCartItems();
    renderSubtotal();
}

// Calculate and render subtotal, tip, total price and total items
function renderSubtotal() {
    let totalItems = 0;
    let subtotal = 0;
    let tip = 0;

    cart.forEach((item) => {
        subtotal += item.price * item.numberOfUnits;
        totalItems += item.numberOfUnits;
    });

    tip = (subtotal * 0.1).toFixed(2);
    totalPrice = (subtotal * 1.1).toFixed(2);

    subtotalEl.innerHTML = `${subtotal.toFixed(2)}`;
    tipEl.innerHTML = `${tip}`;
    totalItemsEl.innerHTML = ` ${totalItems}`;
    totalPriceEl.innerHTML = `&euro; ${totalPrice}`;
}

// Function to render cart items
function renderCartItems() {
    cartItemsEl.innerHTML = "";
    cart.forEach((item) => {
        cartItemsEl.innerHTML += `
        <div class="cart-item row pb-2">
            <div class="col ps-1">
                <a href="#" onClick="removeItemFromCart(${item.id})">
                    <i class="fas fa-trash-alt pe-1"></i>
                </a>${item.name}
            </div>
            <div class="col">&euro; ${item.price.toFixed(2)}</div>
            <div class="col pe-0">
                <div class="col">
                    <a href="#" onclick="changeNumberOfUnits('minus', ${item.id})">
                        <i class="fas fa-minus px-0"></i>
                    </a>
                    ${item.numberOfUnits}
                    <a href="#" onclick="changeNumberOfUnits('plus', ${item.id})">
                        <i class="fas fa-plus px-0"></i>
                    </a>
                </div>
            </div>
        </div>
        `;
    });
}

// Remove item from cart
function removeItemFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    updateCart();
}

// Change number of units for an item
function changeNumberOfUnits(operator, id) {
    cart = cart.map((item) => {
        let numberOfUnits = item.numberOfUnits;
        if (item.id === id) {
            if (operator === "plus") {
                numberOfUnits++;
            } else if (operator === "minus" && numberOfUnits > 1) {
                numberOfUnits--;
            }
        }
        return {
            ...item,
            numberOfUnits,
        };
    });
    updateCart();
}

// Function to calculate change
function change() {
    const cashReceived = document.getElementById("cash-received").value;
    let change = cashReceived - totalPrice;
    changeEl.innerHTML = `&euro; ${change.toFixed(2)}`;
}

// Insert date and time
const dt = new Date();
const time = new Date();
document.getElementById("date").innerHTML = (("0" + dt.getDate()).slice(-2)) + "." + (("0" + (dt.getMonth() + 1)).slice(-2)) + "." + (dt.getFullYear());
document.getElementById("time").innerHTML = (("0" + time.getHours()).slice(-2)) + ":" + (("0" + time.getMinutes()).slice(-2));

// Save sale to Local Storage
function saveSaleToLocalStorage(cart, totalPrice) {
    const sale = {
        items: cart,
        total: totalPrice,
        date: new Date().toISOString(),
    };
    let sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));
    console.log("Sale saved:", sale);  // Debugging log
}

// Get sales for a specific month and year
// Get sales for a specific month and year
function getSalesForMonth(month, year) {
    const sales = JSON.parse(localStorage.getItem("sales")) || [];
    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === month && saleDate.getFullYear() === year;
    });
}

// Generate monthly report
function generateMonthlyReport(month, year) {
    const sales = getSalesForMonth(month, year);

    let productSales = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!item.price || !item.numberOfUnits) {
                console.error(`Invalid item data:`, item);
                return;
            }

            // Βεβαιωνόμαστε ότι οι τιμές είναι αριθμητικές
            const price = parseFloat(item.price);
            const units = parseInt(item.numberOfUnits);

            if (isNaN(price) || isNaN(units)) {
                console.error(`NaN detected for item: ${item.name}`, item);
                return;
            }

            if (!productSales[item.name]) {
                productSales[item.name] = { units: 0, totalRevenue: 0 };
            }

            productSales[item.name].units += units;
            productSales[item.name].totalRevenue += price * units;
        });
    });

    console.log("Report Data:", productSales);  // Debugging log
    return productSales;
}


// Event listeners for buttons
document.addEventListener('DOMContentLoaded', function () {
    // Register sale button
    document.querySelector('#registerSaleBtn').addEventListener('click', function (event) {
        event.preventDefault(); // Αποφυγή της προεπιλεγμένης συμπεριφοράς του συνδέσμου
        saveSaleToLocalStorage(cart, totalPrice); // Αποθήκευση της πώλησης στο Local Storage
        alert('Sale registered successfully!'); // Μήνυμα επιβεβαίωσης
        clearCart(); // Εκκαθάριση καλαθιού
    });

    // Clear cart button
    document.querySelector('#clearCartBtn').addEventListener('click', function (event) {
        event.preventDefault(); // Αποφυγή της προεπιλεγμένης συμπεριφοράς του συνδέσμου
        clearCart(); // Εκκαθάριση καλαθιού
        alert('Cart cleared!'); // Μήνυμα επιβεβαίωσης
    });
});

// Function to clear cart
function clearCart() {
    cart = []; // Εκκαθάριση καλαθιού
    updateCart(); // Ενημέρωση του UI για να εμφανιστεί το άδειο καλάθι
}

// Χειρισμός του κουμπιού Generate Report
document.querySelector('#generateReportBtn').addEventListener('click', function () {
    Swal.fire({
        title: 'Enter Security Code',
        input: 'password',
        inputAttributes: {
            maxlength: 4,
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.value === '1234') {  // Έλεγχος του σωστού κωδικού
            Swal.fire('Success', 'Code accepted. Generating report...', 'success').then(() => {
                const month = parseInt(document.getElementById("report-month").value) - 1; // Μείωση κατά 1 για τον σωστό μήνα
                const year = parseInt(document.getElementById("report-year").value);
                generateMonthlyReportHTML(month, year); // Κλήση της λειτουργίας για την αναφορά
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('Cancelled', 'Operation cancelled', 'error');
        } else {
            Swal.fire('Error', 'Incorrect security code', 'error');
        }
    });
});

function generateMonthlyReportHTML(month, year) {
    const reportData = generateMonthlyReport(month, year);

    if (Object.keys(reportData).length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Sales Data',
            text: 'No sales data found for this month and year.',
            confirmButtonText: 'OK'
        });
        return;
    }

    function generateMonthlyReport(month, year) {
        const sales = getSalesForMonth(month, year);

        let productSales = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = { units: 0, totalRevenue: 0 };
                }
                productSales[item.name].units += item.numberOfUnits || 0;
                productSales[item.name].totalRevenue += (item.price * item.numberOfUnits) || 0;
            });
        });

        console.log("Report Data:", productSales);  // Debugging log
        return productSales;
    }


    let reportHTML = '<div class="monthly-report">';
    reportHTML += '<h3>Monthly Sales Report</h3>';
    reportHTML += '<h4>Month: ' + (month + 1) + ' Year: ' + year + '</h4>';
    reportHTML += '<table class="table">';
    reportHTML += '<thead><tr><th>Product</th><th>Units Sold</th><th>Total Revenue</th></tr></thead><tbody>';

    for (const product in reportData) {
        if (reportData.hasOwnProperty(product)) {
            reportHTML += `<tr><td>${product}</td><td>${reportData[product].units}</td><td>&euro; ${reportData[product].totalRevenue.toFixed(2)}</td></tr>`;
        }
    }

    reportHTML += '</tbody></table>';
    reportHTML += '</div>';

    Swal.fire({
        title: 'Monthly Sales Report',
        html: reportHTML,
        showCancelButton: true,
        confirmButtonText: 'Print',
        cancelButtonText: 'Close',
        customClass: {
            confirmButton: 'btn btn-success me-2',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false,
        preConfirm: () => {
            printReport();
        }
    });
}

function printReport() {
    const reportContent = document.querySelector('.swal2-html-container .monthly-report').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = reportContent;
    window.print();
    document.body.innerHTML = originalContent;
}
