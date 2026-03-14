export default function DonateTabDummy() {
  // Esta tela nunca será renderizada pois o _layout.tsx intercepta o clique na Tab
  // e faz um router.push('/donate').
  // O arquivo precisa existir fisicamente para o botão aparecer na TabBar.
  return null;
}
