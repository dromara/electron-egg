import iconFont from './iconFont';

// Use import.meta.globEager to dynamically import all .vue files in the directory
const modules: { [key: string]: { default: any } } = import.meta.glob('./*.vue', { eager: true });

// Create a map of component names to their default exports
const map: { [key: string]: any } = {};
Object.keys(modules).forEach(file => {
  const moduleName = file.replace('./', '').replace('.vue', '');
  map[moduleName] = modules[file].default;
});

// Combine the dynamically imported components with the iconFont component
const globalComponents = {
  ...map,
  iconFont,
};

export default globalComponents;