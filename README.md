# OpenClassrooms Projet 09 : Billed

**Objectif :** Débugger et tester un SaaS RH.

## Contexte

SaaS de l’entreprise imaginaire “Billed”.

L’entreprise produit des solutions SaaS destinées aux équipes de ressources humaines.

Dans cette perspective, ma mission était d’implémenter des tests unitaires et d'intégration ainsi que de corriger une liste de bugs. Le détail de la procédure peut être trouvé dans le fichier PDF "TODO_list" ainsi qu'une capture d'écran de la couverture des différents tests, présents dans le dossier "Docs" de ce Repo.

De plus, je devais écrire un plan de test End to End pour guider la personne qui devra faire le test manuellement. Ce document "plan_tests_E2E.pdf" est également présent dans le dossier "Docs" de ce Repo.

## L'architecture du projet

Ce projet, le front-end de l'application, est connecté à un service API back-end qui doit aussi être lancé en local.

Le projet back-end se trouve ici: https://github.com/Cycle9898/OC_Projet-9_Billed_Back

### Organiser l'espace de travail

Pour une bonne organization, vous pouvez créer un dossier bill-app dans lequel vous allez cloner le projet back-end et par la suite, le projet front-end:

Clonez le projet back-end dans le dossier bill-app :

```
$ git clone https://github.com/Cycle9898/OC_Projet-9_Billed_Back.git
```

```
bill-app/
   - Billed-app-FR-Back
```

Clonez le projet front-end dans le dossier bill-app :

```
$ git clone https://github.com/Cycle9898/OC_Projet-9_Billed_Front.git
```

```
bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## Lancement de l'application en local

### Etape 1 - Lancer le back-end :

Suivez les indications dans le README du projet [back-end](https://github.com/Cycle9898/OC_Projet-9_Billed_Back).

### Etape 2 - Lancer le front-end :

Allez au repo cloné :

```
$ cd Billed-app-FR-Front
```

Installez les dépendances :

```
$ yarn
```

Ouvrez le projet dans VS Code et lancer l'extension "Live server"

Ou installez live-server pour lancer un serveur local :

```
$ yarn global add live-server
```

Lancez l'application :

```
$ live-server
```

Puis allez à l'adresse : `http://localhost:8080/`

## Lancement des tests en local avec Jest

### Tous les tests

```
$ yarn test
```

### Un seul test

Installez jest-cli :

```
$yarn global add jest-cli
$jest src/__tests__/your_test_file.js
```

### Voir la couverture de test

Une fois le front-end et le back-end lancés, ouvrir `http://localhost:8080/coverage/lcov-report/` dans un navigateur web.

## Comptes et utilisateurs :

Vous pouvez vous connecter en utilisant les comptes:

### administrateur :

```
utilisateur : admin@test.tld
mot de passe : admin
```

### employé :

```
utilisateur : employee@test.tld
mot de passe : employee
```
