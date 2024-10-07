function redirectToPage(){
    if(x.checked){
        window.location.href="userDetails&Quiz.html";
    }
}
let x=document.getElementById("agree");
x.addEventListener('change',redirectToPage)
