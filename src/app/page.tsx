
import CellularAutomataExplorer from '@/components/cellular-automata-explorer';
import { BookOpen } from 'lucide-react'; // Import the icon

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-sm sticky top-0 bg-background z-10">
        <h1 className="text-3xl font-headline text-center text-primary">
          Game of Life
        </h1>
        <p className="text-sm text-muted-foreground text-center font-body">Conway's Game of Life</p>
        <div className="mt-2 text-xs text-muted-foreground text-center font-body flex items-center justify-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <span>
            Learn more about{' '}
            <a
              href="https://en.wikipedia.org/wiki/John_Horton_Conway"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              John Conway
            </a>
            , the{' '}
            <a
              href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Game of Life
            </a>
            , or visit the{' '}
            <a
              href="https://conwaylife.com/wiki/Main_Page"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LifeWiki
            </a>
            .
          </span>
        </div>
      </header>
      <div className="flex-1 overflow-auto"> 
        <CellularAutomataExplorer />
      </div>
      <footer className="p-4 border-t border-border text-center text-xs text-muted-foreground">
        Developed by{' '}
        <a
          href="https://www.github.com/Amalshaheen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Amalshaheen
        </a>
      </footer>
    </div>
  );
}
