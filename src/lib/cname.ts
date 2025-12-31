export async function verifyCNAME(domain: string) {
  const res = await fetch(\`https://dns.google/resolve?name=\${domain}\`);
  return res.ok;
}
