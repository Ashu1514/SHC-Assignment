const BASE_URL = "https://73cm3i4h0f.execute-api.ap-south-1.amazonaws.com/dev";
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const signUp = async (event) => {
  event.preventDefault();
  const button = document.querySelector("#signup_form button");
  const output = document.querySelector("#sign_up_message");
  const elements = event.target.elements;
  try {
    const payload = {
      name: elements.name.value,
      phone: elements.phone.value,
      email: elements.email.value,
      password: elements.password.value,
    };

    const res = await fetch(BASE_URL + "/signUp", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
    });
    const response = await res.json();
    if (!res.ok) {
      throw response;
    }
    console.log(response);
  } catch (error) {
    console.log(error);
    output.innerHTML = error.message;
  } finally {
    setTimeout(() => {
      output.innerHTML = "";
    }, 3000);
  }
};
