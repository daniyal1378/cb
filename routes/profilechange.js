function check(form) {
    const states = ['تهران','آذربایجان شرقی','آذربایجان غربی','اردبیل','اصفهان','البرز','ایلام','بوشهر','چهارمحال و بختیاری','خراسان رضوی','خراسان جنوبی','خراسان شمالی','یزد','همدان','هرمزگان','مرکزی','مازندران','لرستان','گیلان','گلستان','کهگیلویه و بویراحمد','کرمانشاه','کرمان','کردستان','قم','قزوین','فارس','سیستان و بلوچستان','سمنان','زنجان','خوزستان']
    let bio = '',
        asl = '';
    if (form.name && form.age && form.state){
        const re1 = /^[-_.)(،پچجحخهعغفقثصضشسیبلاتنمکگوئدذرزطظژ1234567890\sa-zA-z]{0,255}$/;
        const re2 = /^[پچجحخهعغفقثصضشسیبلاتنمکگوئدذرزطظژ1234567890\sa-zA-z]{3,25}$/;
        const re3 = /^[10-99]{2}$/;
        if (form.bio){
            if(re1.test(String(form.bio)) === false)
            {
                return {statue : false};
            }else{
                bio = form.bio ;
            }
        }
        if(form.asl){
            if(!re1.test(String(form.asl)))
            {
                return {statue : false};
            }else {
                asl = form.asl ;
            }
        }
        if(!states.find(user => user === form.state))
        {
            return {statue : false};
        }
        if(!re2.test(String(form.name))){
            return {statue : false};
        }
        if(!re3.test(String(form.age))){
            return {statue : false};
        }
        if(form.single !== '1' && form.single !== '2')
        {
            return {statue : false};
        }
        return {statue : true , bio : bio , asl : asl};
    } else {
        return {statue : false }
    }
}
module.exports.check = check;