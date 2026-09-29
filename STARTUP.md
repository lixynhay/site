# 🚀 Инструкция по запуску

## ⚠️ ВАЖНО: Live Server НЕ работает с этим проектом!

Этот проект использует **Vite + React + TypeScript**, поэтому **Live Server плагин VSCode не подходит**.

### Почему Live Server не работает?

❌ Live Server предназначен только для статических HTML файлов  
❌ Не понимает TypeScript (.tsx, .ts файлы)  
❌ Не поддерживает ES modules  
❌ Не компилирует React компоненты  
❌ Не обрабатывает Tailwind CSS  

---

## ✅ ПРАВИЛЬНЫЙ способ запуска

### 1️⃣ Откройте терминал в VSCode

```
Ctrl + ` (или View → Terminal)
```

### 2️⃣ Установите зависимости (если ещё не установлены)

```bash
npm install
```

### 3️⃣ Запустите dev сервер

```bash
npm run dev
```

или

```bash
npm start
```

### 4️⃣ Откройте браузер

Перейдите по адресу: **http://localhost:5173**

---

## 📋 Все доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev сервера с HMR |
| `npm start` | Альтернатива для `dev` |
| `npm run build` | Сборка для production |
| `npm run preview` | Предпросмотр production сборки |
| `npm run typecheck` | Проверка TypeScript типов |

---

## 🎯 Преимущества Vite dev server

✅ **Мгновенный запуск** - сервер стартует за миллисекунды  
✅ **Hot Module Replacement** - изменения применяются без перезагрузки  
✅ **TypeScript поддержка** - автоматическая компиляция .tsx/.ts  
✅ **Tailwind CSS JIT** - стили генерируются на лету  
✅ **Source Maps** - удобная отладка  
✅ **Fast Refresh** - мгновенное обновление React компонентов  

---

## 🔧 Если возникли проблемы

### Ошибка: "Cannot find module"

```bash
npm install
```

### Ошибка: "Port 5173 is already in use"

```bash
# Убейте процесс на порту 5173 или используйте другой порт
npm run dev -- --port 3000
```

### Ошибка: "npm не найдена"

Установите Node.js: https://nodejs.org/

### Сервер запускается, но страница пустая

1. Откройте DevTools (F12)
2. Проверьте вкладку Console на ошибки
3. Убедитесь, что все зависимости установлены (`npm install`)

---

## 💡 Советы по разработке

### Автозапуск в VSCode

Создайте файл `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "npm",
      "script": "dev",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Затем нажмите `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Dev Server`

### Рекомендуемые расширения VSCode

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Pretty TypeScript Errors**

---

## 📦 Production сборка

```bash
# Сборка оптимизированной версии
npm run build

# Предпросмотр production версии
npm run preview
```

Production файлы будут в папке `dist/`

---

## 🆘 Нужна помощь?

1. Проверьте версию Node.js: `node --version` (должна быть 18+)
2. Удалите `node_modules` и `package-lock.json`, затем `npm install`
3. Очистите кэш: `npm cache clean --force`

---

**Запомните: Используйте `npm run dev` вместо Live Server!** 🚀
