function signup(form) {
    if(form.name&&form.username&&form.password&&form.gender&&form.age&&form.state) {
        const states = ['تهران','آذربایجان شرقی','آذربایجان غربی','اردبیل','اصفهان','البرز','ایلام','بوشهر','چهارمحال و بختیاری','خراسان رضوی','خراسان جنوبی','خراسان شمالی','یزد','همدان','هرمزگان','مرکزی','مازندران','لرستان','گیلان','گلستان','کهگیلویه و بویراحمد','کرمانشاه','کرمان','کردستان','قم','قزوین','فارس','سیستان و بلوچستان','سمنان','زنجان','خوزستان']
        console.log(states.length);
        let emailvalid = 'noemail';
        if (form.email) {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(re.test(String(form.email))) {
                emailvalid = form.email;
                console.log(form.email);
            }
        }
        const re1 = /^[پچجحخهعغفقثصضشسیبلاتنمکگوئدذرزطظژ1234567890\sa-zA-z]{3,25}$/;
        const ch1 = re1.test(String(form.name));
        const re2 = /^[1234567890a-zA-z]{3,25}$/;
        const ch2 = re2.test(String(form.username));
        const re3 = /^[10-99]{2}$/;
        if(form.password.length<3 || form.password.length>25) {
            return false;
        }
        if(form.gender !== '1' && form.gender !== '2')
        {
            return false
        }
        if(!states.find(user => user === form.state))
        {
            return false;
        }
        if(!re3.test(String(form.age))){
            return false;
        }
        if(ch1&&ch2)
        {
            return {statue : true , email : emailvalid};
        }else
        {
            return false ;
        }
    }
    else
    {
        return false;
    }
}
module.exports.signup = signup;