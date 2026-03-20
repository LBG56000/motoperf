<script setup lang="ts"></script>

<template>
  <div>
    <div class="footer">
      <div>
        <h4>Guides</h4>
        <div class="list">
          <div class="list-item"><NuxtLink to="/">Accueil</NuxtLink></div>
          <div class="list-item">Comparateur</div>
          <div class="list-item">Forum</div>
          <div class="list-item">Balades</div>
          <div class="list-item">
            <NuxtLink to="/knowUs">Nous connaitre</NuxtLink>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-hidden">Réseaux sociaux</h4>
        <div class="list">
          <div class="list-item-rs">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span>Instagram</span>
              <UIcon name="i-lucide-instagram" class="size-7 icons" />
            </a>
          </div>
          <div class="list-item-rs">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span>Facebook</span>
              <UIcon name="i-lucide-facebook" class="size-7 icons" />
            </a>
          </div>
          <div class="list-item-rs">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span>Youtube</span>

              <UIcon name="i-lucide-youtube" class="size-7" />
            </a>
          </div>
          <div class="list-item-rs">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span>Linkedin</span>
              <UIcon name="i-lucide-linkedin" class="size-7 icons" />
            </a>
          </div>
          <div class="list-item-rs">
            <a
              href="https://www.x.com"
              target="_blank"
              rel="noopener noreferrer"
              class="align-icon"
            >
              <span>X</span>
              <UIcon name="i-lucide-x" class="size-7 icons" />
            </a>
          </div>
        </div>
      </div>

      <div>
        <h4>Contact</h4>
        <div class="list">
          <div class="list-item">
            <a class="link-mail" href="mailto:sloan.morgant@mgtsoftware.com"
              >sloan.morgant@mgtsoftware.com</a
            >
          </div>
          <div class="list-item">
            <a class="link-mail" href="mailto:loris.caruhel@mgtsoftware.com"
              >loris.caruhel@mgtsoftware.com</a
            >
          </div>
          <div class="list-item">
            <a
              class="link-mail"
              href="mailto:milio.lintanff--castel@mgtsoftware.com"
              >milio.lintanff--castel@mgtsoftware.com</a
            >
          </div>
          <div class="list-item">
            <a class="link-mail" href="mailto:leo.bruneau-gache@mgtsoftware.com"
              >leo.bruneau-gache@mgtsoftware.com</a
            >
          </div>
          <div class="list-item">
            <a class="link-mail" href="mailto:nominoe.barbotaud@mgtsoftware.com"
              >nominoe.barbotaud@mgtsoftware.com</a
            >
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
}

.footer div .list-item-rs {
  width: 100%;
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

  .footer div:nth-child(2) .list {
    display: flex;
    justify-content: center;
    gap: 1.2rem;
    text-align: center;
  }

  .text-hidden {
    visibility: hidden;
  }
}
</style>
