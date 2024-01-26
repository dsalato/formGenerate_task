// Функция получения файла JSON
const getDataJson = async () => {
    // Получаем элемент select
    let selectElement = document.getElementById('formSelector') as HTMLSelectElement;

    // Получаем выбранное значение
    let selectedValue: any = selectElement.options[selectElement.selectedIndex].value;

    // Проверяем, что значение не пустое
    if (selectedValue) {
        // Формируем URL для fetch
        let apiUrl = './data/' + selectedValue;

        // Используем fetch для отправки запроса
        const response = await fetch(apiUrl);
        return response.json();
    } else {
        console.error('Выберите форму перед отправкой запроса.');
    }
}
// Функция для генерации формы
const generateForm = async () => {
    const data =  await getDataJson();
    const formContainer = document.getElementById("form");
    // Проверяем есть ли тег form, если есть, то удаляем
    document.querySelector('form') && formContainer.removeChild(document.querySelector('form'));

    const form = document.createElement('form');
    // Установливаем атрибуты формы
    form.setAttribute('method', 'post');

    // Добавляем заголовок и описание формы
    const title = document.createElement('h2');
    title.textContent = data.title;
    form.appendChild(title);

    const description = document.createElement('p');
    description.textContent = data.description;
    form.appendChild(description);
    // Добавляем поля формы
    data.fields.forEach(field => {
        const { label, attrs: { type, name, variants } } = field;
        const inputElement = createInputElement(type, name, variants);

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.appendChild(inputElement);

        form.appendChild(labelElement);
    });

    function createInputElement(type, name, variants) {
        // Создание input Elements в зависимости от type
        switch (type) {
            case 'select':
                const selectElement = document.createElement('select');
                selectElement.setAttribute('name', name);
                variants.forEach(variant => {
                    selectElement.innerHTML += `<option value="${variant.value}">${variant.label}</option>`;
                });
                return selectElement;

            case 'radio':
            case 'checkbox':
                const inputContainer = document.createElement('label');
                variants.forEach(variant => {
                    const input = document.createElement('input');
                    input.setAttribute('type', type);
                    input.setAttribute('name', name);
                    input.setAttribute('value', variant.value);
                    const label = document.createElement('span');
                    label.textContent = variant.label;
                    const container = document.createElement('label');
                    container.appendChild(input);
                    container.appendChild(label);
                    inputContainer.appendChild(container);
                });
                return inputContainer;

            case 'text':
            case 'textarea':
            default:
                const input = document.createElement('input');
                input.setAttribute('type', type);
                input.setAttribute('name', name);
                return input;
        }
    }
    // Добавляем кнопки формы
    data.buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('type', button === 'submit' ? 'submit' : 'reset');
        buttonElement.textContent = button;
        form.appendChild(buttonElement);
    });
    // Добавить форму в контейнер
    formContainer.appendChild(form);
    // Вывод данных из формы в консоль
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formElement = event.target as HTMLFormElement;
        // Собрать данные формы
        const formData = new FormData(formElement);
        // Преобразовать данные в объект JSON
        const formObject: any = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        // Вывести данные в консоль
        console.log(formObject);
    });
}