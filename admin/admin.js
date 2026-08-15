const API_URL = "http://localhost:5000";



// CHECK ADMIN LOGIN


function checkAdmin() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    // No login information
    if (!token || !userData) {

        window.location.href =
            "../src/index.html";

        return null;
    }


    let user;

    try {

        user = JSON.parse(userData);

    } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "../src/index.html";

        return null;
    }


    // Check role
    if (user.role !== "admin") {

        alert("You do not have admin access.");

        window.location.href =
            "../index.html";

        return null;
    }


    return {
        token: token,
        user: user
    };
}




// LOAD ADMIN DASHBOARD


async function loadDashboard() {

    const auth = checkAdmin();

    if (!auth) {
        return;
    }


    const token = auth.token;
    const user = auth.user;


   
    // DISPLAY ADMIN INFORMATION
   

    const adminEmail =
        document.getElementById("adminEmail");

    if (adminEmail) {

        adminEmail.textContent =
            user.email;

    }


    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );

    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome back, ${user.name}`;

    }

if (!document.getElementById("totalProducts")) {
        return;
    }
    
    // GET DASHBOARD DATA FROM BACKEND
    

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/dashboard`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // Backend returned error
        if (!response.ok) {

            alert(
                data.message ||
                "Failed to load dashboard."
            );

            return;
        }


     
       const totalProductsEl = document.getElementById("totalProducts");
if (totalProductsEl) {
    totalProductsEl.textContent = data.statistics.totalProducts;
}

const totalUsersEl = document.getElementById("totalUsers");
if (totalUsersEl) {
    totalUsersEl.textContent = data.statistics.totalUsers;
}

   
        // ORDERS
      

        document.getElementById(
            "totalOrders"
        ).textContent = "0";


        
        // REVENUE
      

        document.getElementById(
            "totalRevenue"
        ).textContent = "৳0";


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}




// LOGOUT


function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    window.location.href =
        "../index.html";
}




// START DASHBOARD


loadDashboard();