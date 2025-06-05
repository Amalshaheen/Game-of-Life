import CellularAutomataExplorer from '@/components/cellular-automata-explorer';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-sm sticky top-0 bg-background z-10">
        <h1 className="text-3xl font-headline text-center text-primary">
          Game Of Life
        </h1>
        <p className="text-sm text-muted-foreground text-center font-body">Conway's Game of Life</p>
      </header>
      <div className="flex-1 overflow-auto"> 
        <CellularAutomataExplorer />
      </div>
    </div>
  );
}
