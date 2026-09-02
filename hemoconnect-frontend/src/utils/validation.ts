export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Parola trebuie să aibă cel puțin 8 caractere.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Parola trebuie să conțină cel puțin o literă mare.";
  }
  if (!/[a-z]/.test(password)) {
    return "Parola trebuie să conțină cel puțin o literă mică.";
  }
  if (!/[0-9]/.test(password)) {
    return "Parola trebuie să conțină cel puțin o cifră.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Parola trebuie să conțină cel puțin un caracter special.";
  }
  return null;
};
