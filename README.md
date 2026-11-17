# Maquette Mici Menuiserie (Charabia)

Mettre en ligne sur Vercel depuis le Terminal du Mac :

    cd ~/Downloads/site-mici      (le dossier dézippé)
    npx vercel --prod

La première fois, Vercel ouvre le navigateur pour se connecter au compte Charabia.
Répondre « Y » aux questions, garder les réglages proposés (Vite, dossier dist).

La page est marquée « noindex » : Google ne l'indexera pas tant que c'est une maquette.
Le formulaire de devis n'envoie rien tant que les variables SMTP ne sont pas ajoutées dans Vercel.
