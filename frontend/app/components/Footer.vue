<script setup lang="ts">
const guides = [
  { label: 'Accueil', to: '/' },
  { label: 'Comparateur' },
  { label: 'Forum' },
  { label: 'Balades' },
  { label: 'Nous connaitre', to: '/knowUs' }
]

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com',
    icon: 'i-lucide-instagram'
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com',
    icon: 'i-lucide-facebook'
  },
  {
    label: 'Youtube',
    href: 'https://www.youtube.com',
    icon: 'i-lucide-youtube'
  },
  {
    label: 'Linkedin',
    href: 'https://www.linkedin.com',
    icon: 'i-lucide-linkedin'
  },
  { label: 'X', href: 'https://www.x.com', icon: 'i-lucide-x' }
]

const contacts = [
  'sloan.morgant@mgtsoftware.com',
  'loris.caruhel@mgtsoftware.com',
  'milio.lintanff--castel@mgtsoftware.com',
  'leo.bruneau-gache@mgtsoftware.com',
  'nominoe.barbotaud@mgtsoftware.com'
]
</script>

<template>
  <div>
    <div class="footer">
      <div>
        <h4>Guides</h4>
        <div class="list">
          <div
            class="list-item"
            v-for="(item, idx) in guides"
            :key="`guide-${idx}`"
          >
            <template v-if="item.to">
              <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            </template>
            <template v-else>
              {{ item.label }}
            </template>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-hidden">Réseaux sociaux</h4>
        <div class="list">
          <div
            class="list-item-rs"
            v-for="(item, idx) in socials"
            :key="`social-${idx}`"
          >
            <a
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span class="span-rs">{{ item.label }}</span>
              <UIcon :name="item.icon" class="size-7 icons" />
            </a>
          </div>
        </div>
      </div>

      <div>
        <h4>Contact</h4>
        <div class="list">
          <div
            class="list-item"
            v-for="(email, idx) in contacts"
            :key="`contact-${idx}`"
          >
            <a class="link-mail" :href="`mailto:${email}`">{{ email }}</a>
          </div>
        </div>
      </div>
    </div>

    <hr class="text-hidden" />

    <div class="footer end">
      <p class="p-mini">Droit d’auteur © 2026 MotoCenter Tout droit réservé</p>
      <p class="p-mini">Mentions légales</p>
      <p class="p-mini">
        Conditions d'utilisation et politique de confidentialité
      </p>
    </div>
  </div>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: space-around;
  align-items: start;
}

.end {
  margin-bottom: 2em;
}

.footer div {
  flex: 1;
  text-align: center;
}

.icons {
  display: flex;
  align-items: end;
}

.footer div .list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  margin: 0.5rem auto;
  max-width: 370px;
  width: 100%;
  list-style: none;
  padding-left: 0;
}

.footer div .list-item {
  width: 100%;
  display: flex;
  align-items: start;
  margin-bottom: 0.4em;
}

.footer div .list-item-rs {
  width: 100%;
  margin-bottom: 0.4em;
}

.footer div h4,
.footer div h3 {
  margin-bottom: 0.6rem;
}

.align-icon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.6rem;
}

.align-icon > span {
  order: 1;
  margin-left: 0;
}

.align-icon > u-icon {
  order: 2;
  font-size: 15px;
  font-weight: 300;
}
.p-mini {
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  font-weight: 300;
}

/* Mobile layout  */
@media (max-width: 1024px) {
  .footer {
    flex-wrap: wrap;
  }

  .footer div {
    flex: 1 1 50%;
  }

  .footer div:nth-child(2) {
    order: 3;
    flex: 1 1 100%;
  }

  .text-hidden {
    visibility: hidden;
  }

  .footer.end {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.4rem;
  }

  .span-rs {
    display: none;
  }
  .footer div:nth-child(2) .list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 1.5rem;
  }

  .align-icon {
    justify-content: center;
  }

  .list-item-rs {
    max-width: 40px;
  }
}
</style>
