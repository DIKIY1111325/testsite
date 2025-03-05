// Инициализация Supabase
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co'; // Ваш Project URL
const supabaseKey = 'your-anon-key'; // Ваш Anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Получение параметра redirect из URL
const urlParams = new URLSearchParams(window.location.search);
const redirectPage = urlParams.get('redirect') || 'index.html'; // По умолчанию перенаправляем на главную страницу

// Обработка формы
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    // Проверка, существует ли пользователь
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},phone.eq.${phone}`)
        .single();

    if (userError || !userData) {
        // Пользователь не найден, регистрируем
        const { user, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (signUpError) {
            alert('Ошибка регистрации: ' + signUpError.message);
        } else {
            // Сохранение данных пользователя в таблице `users`
            const { data, error: dbError } = await supabase
                .from('users')
                .insert([{ id: user.id, email: email, phone: phone }]);

            if (dbError) {
                alert('Ошибка добавления пользователя: ' + dbError.message);
            } else {
                alert('Регистрация прошла успешно!');
                window.location.href = redirectPage; // Перенаправление на выбранную страницу
            }
        }
    } else {
        // Пользователь найден, пробуем войти
        const { user, error: signInError } = await supabase.auth.signIn({
            email: userData.email,
            password: password,
        });

        if (signInError) {
            // Пароль неверный
            alert('Неверный пароль. Хотите восстановить пароль?');
            window.location.href = 'password-reset.html'; // Перенаправление на страницу восстановления пароля
        } else {
            // Успешный вход
            alert('Вход выполнен успешно!');
            window.location.href = redirectPage; // Перенаправление на выбранную страницу
        }
    }
});