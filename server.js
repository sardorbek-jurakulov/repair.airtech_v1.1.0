const express = require('express');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

// Initial routes
app.use('/', require('./routes/main'));

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// refactoring:
// 1. catchlarni logikalarini o'ylab, yozib chiqish kerak.
// 2. ma'lumotlarni .xlc va .xlcx formatlariga upload va download xususiyatlarini qo'shish kerak.
// 3. o'zgarishlarni runtime bo'ladigan qilish kerak.
// 4. Browserlar qanday tilda bo'lishidan qat'iy nazar date inputlarini qiymatlarining formati bir xil chiqadigan qilishim kerak.
// 5. Tizimda shunday xatolik borki agar bir foydalanuvchi ochib turgan ma'lumotlarni boshqa joydalanuvchi o'chirib yuborsa ochib turgan foydalanuvchiga undefined qiymatlar ketib front'da xatolik chiqib qolishi mumkun. Buni to'g'irlash uchun bazadan olingan qiymatlarni mavjudligini tekshirib keyin front'ga jo'natish kerak yoki ?. belgisidan foydalanish kerak.
// 6. ko'rsatilgan route'lardan boshqa route'ga murojat qilingandagi holatni handle qilish kerak.
// 7. spareForm'da currentUser'ning full_name qiymati chiqmayapti.