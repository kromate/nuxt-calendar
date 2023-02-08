import { defineNuxtModule, addComponent, createResolver } from "@nuxt/kit";

// Module options TypeScript inteface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-calendar",
    configKey: "nuxtCalendar",
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addComponent({
      name: "NuxtCalendar",
      filePath: resolver.resolve("./runtime/components/nuxt-calendar"),
      mode: "client",
    });
  },
});
