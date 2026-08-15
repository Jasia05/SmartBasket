

document.getElementById("addProductForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const productData = {
        name: document.getElementById("name").value,
        brand: document.getElementById("brand").value,
        category: document.getElementById("category").value,
        price: Number(document.getElementById("price").value),
        unit: document.getElementById("unit").value,
        stock: Number(document.getElementById("stock").value),
        image: document.getElementById("image").value,
        description: document.getElementById("description").value,
        isPopular: document.getElementById("isPopular").checked,
    };

    try {
        const response = await fetch(`${API_URL}/api/admin/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to add product.");
            return;
        }

        alert("Product added successfully!");
        document.getElementById("addProductForm").reset();

    } catch (error) {
        console.error("Add product error:", error);
        alert("Could not connect to the backend.");
    }
});