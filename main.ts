type variantType = {
    value: string,
    label: string
}
type attrsType = {
    name: string,
    type: string,
    variants?: variantType[]
}
type fieldType = {
    label: string,
    attrs: attrsType
}
type formType = {
    title: string,
    description?: string,
    fields: fieldType[],
    buttons: string[]
}

// Функция получения файла JSON
const getDataJson = async () => {
    // Получаем элемент select
    let selectElement = document.getElementById('formSelector') as HTMLSelectElement;

    // Получаем выбранное значение
    let selectedValue: string  = selectElement.options[selectElement.selectedIndex].value;

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
const generateForm = async()  => {
    const data: formType =  await getDataJson();
    const formContainer = document.getElementById("form");
    // Проверяем есть ли тег form, если есть, то удаляем
    document.querySelector('form') && formContainer.removeChild(document.querySelector('form'));

    const form = document.createElement('form');
    form.id = 'generateForm';
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
    data.fields.forEach((field:fieldType) => {
        const { label, attrs: { type, name, variants } } = field;
        const inputElement = createInputElement(type, name, variants);

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.appendChild(inputElement);

        form.appendChild(labelElement);
    });

    function createInputElement(type:string, name:string, variants:variantType[]) {
        // Создание input Elements в зависимости от type
        switch (type) {
            case 'select':
                const selectElement = document.createElement('select');
                selectElement.setAttribute('name', name);
                variants.forEach((variant:variantType) => {
                    selectElement.innerHTML += `<option value="${variant.value}">${variant.label}</option>`;
                });
                return selectElement;

            case 'radio':
            case 'checkbox':
                const inputContainer = document.createElement('label');
                variants.forEach((variant:variantType) => {
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
            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.setAttribute('name', name);
                return textarea;
            case 'text':
            default:
                const input = document.createElement('input');
                input.setAttribute('type', type);
                input.setAttribute('name', name);
                return input;
        }
    }
    // Добавляем кнопки формы
    data.buttons.forEach((button:string) => {
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('type', button === 'submit' ? 'submit' : 'reset');
        buttonElement.textContent = button;
        form.appendChild(buttonElement);
    });
    // Добавить форму в контейнер
    formContainer.appendChild(form);
    // Вывод данных из формы в консоль
    const result = document.getElementById('generateForm');
    console.log(await getFormData(result));

}
//Функция получения данных из формы
const getFormData = (form: HTMLElement) => {
    return new Promise((resolve) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formElement = event.target as HTMLFormElement;
            // Получение формы
            const formData = new FormData(formElement);
            // Преобразование данных в объект JSON
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            resolve(formObject);
        });
    });
};
