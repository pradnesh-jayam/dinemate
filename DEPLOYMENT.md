# DineMate Deployment

This project is static HTML, CSS, and JavaScript with a small Node preview server for local development.

## GitHub Pages

1. Push this folder to a GitHub repository.
2. Open repository Settings > Pages.
3. Choose the main branch and root folder.
4. Save and open the generated Pages URL.

Supabase works on GitHub Pages when `config.js` contains valid project keys and your Supabase auth redirect URLs include the deployed site URL.

## Netlify

1. Create a new Netlify site from the repository.
2. Use no build command.
3. Use the repository root as the publish directory.
4. Deploy.

## Local Preview

```bash
npm start
```
