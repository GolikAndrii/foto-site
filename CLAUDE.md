@AGENTS.md

# Folio — Фотосайт

Next.js 16 + Prisma + Cloudflare R2 + NextAuth v5 (Google OAuth)

## Стек
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **DB**: PostgreSQL через Prisma (`DATABASE_URL`)
- **Хранилище**: Cloudflare R2 (S3-совместимый)
- **Auth**: NextAuth v5 beta, только Google, только `ADMIN_EMAIL`
- **UI**: Tailwind v4, Framer Motion, Sharp (WebP превью)

## Переменные окружения (.env.local)
```
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=golik.andrii@gmail.com
DATABASE_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## Структура
```
src/
  auth.ts                        # NextAuth config
  middleware.ts                  # Защита /admin
  lib/
    prisma.ts                    # Prisma client
    r2.ts                        # Cloudflare R2 helpers
  app/
    page.tsx                     # Landing (немецкий язык, тёмная тема)
    layout.tsx                   # Root layout (Inter + Playfair Display)
    admin/
      layout.tsx                 # Admin layout (тёмный фон)
      page.tsx                   # Список галерей
      galleries/
        new/page.tsx             # Создание галереи
        [id]/page.tsx            # Управление галереей
    api/
      galleries/                 # CRUD галерей
      photos/[id]/               # Удаление, лайки, скачивание
    g/[token]/                   # Публичная галерея (шаринг по токену)
  components/
    admin/AdminHeader.tsx        # Sticky header с blur
```

## Дизайн-система (тёмная тема)
- Фон: `#0C0C0C`
- Карточки: `#141414`
- Границы: `rgba(255,255,255,0.06)`
- Акцент: `#FF6B00` (оранжевый), градиент `#FF6B00 → #FF8C33`
- Текст: `#FAFAFA` / `neutral-400` / `neutral-600`
- Шрифты: `var(--font-playfair)` (заголовки), `var(--font-inter)` (текст)

## История работы
### 19.04.2026 (дома)
- Полная адмін-панель: CRUD галерей
- Drag & drop загрузка фото, WebP превью через Sharp
- Выбор обложки, генерация share-ссылки
- Публичная галерея: сетка 3/5 колонок, Lightbox, лайки, скачивание оригинала
- Улучшенный landing page с иконкой диафрагмы

### 20.04.2026 (рабочий компьютер)
- Полный редизайн в тёмную тему: чёрный + оранжевый (#FF6B00)
- Новый AdminHeader: sticky + blur, иконка диафрагмы, SVG кнопки
- Landing: оранжевый glow, градиентная кнопка, SVG иконки фич
- Исправлен hydration mismatch в SVG ApertureIcon (предвычисление координат)
- Landing переведён полностью на немецкий язык

## Деплой (запланировано)
- Vercel (хостинг)
- Neon (PostgreSQL)
- Cloudflare R2 (уже используется)
