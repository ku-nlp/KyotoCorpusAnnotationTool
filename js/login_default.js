document.addEventListener('DOMContentLoaded', function () {
    const prefix = 'login_value_';

    Array.from(document.getElementsByTagName('select'), s => {
        const key = prefix + s.name;
        const current = window.localStorage.getItem(key);
        if (current !== null) {
            s.value = current;
        }

        s.addEventListener('change', e => {
            console.log(e, e.target.value);
            window.localStorage.setItem(key, e.target.value);
        });
    });
});
