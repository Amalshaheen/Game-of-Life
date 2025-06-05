
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, RefreshCw, SkipBack, Settings2, Zap, Rows, ColumnsIcon, Globe, PackageIcon, Wand2, Type, Save, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription as SheetCardDescription } from '@/components/ui/sheet';
import { type Grid, createGrid, getNextGeneration, type BoundaryCondition, PREDEFINED_SEED_PATTERNS, type SeedPattern, renderTextToGrid, extractPatternFromGrid } from '@/lib/game-of-life';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

const DESKTOP_CELL_SIZE = 12;
const MOBILE_CELL_SIZE = 8;
const DEFAULT_ROWS = 40;
const DEFAULT_COLS = 60;
const DEFAULT_SPEED_MS = 150;
const MAX_HISTORY_SIZE = 100;
const CUSTOM_SEEDS_STORAGE_KEY = 'gameOfLifeCustomSeeds';

const CSS_VAR_ACCENT = '--accent';
const CSS_VAR_MUTED = '--muted';
const CSS_VAR_BORDER = '--border';


export default function CellularAutomataExplorer() {
  const [gridSize, setGridSize] = useState({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });
  const [grid, setGrid] = useState<Grid>(() => createGrid(gridSize.rows, gridSize.cols, true));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED_MS);
  const [history, setHistory] = useState<Grid[]>([]);
  const [boundaryCondition, setBoundaryCondition] = useState<BoundaryCondition>('bounded');
  const [selectedSeedName, setSelectedSeedName] = useState<string>('');
  const [textToSeed, setTextToSeed] = useState<string>('');
  const [customSeedNameInput, setCustomSeedNameInput] = useState<string>('');
  const [customSeedPatterns, setCustomSeedPatterns] = useState<SeedPattern[]>([]);
  
  const [mounted, setMounted] = useState(false);
  const [actualCellAliveColor, setActualCellAliveColor] = useState('');
  const [actualCellDeadColor, setActualCellDeadColor] = useState('');
  const [actualGridLineColor, setActualGridLineColor] = useState('');

  const [isPainting, setIsPainting] = useState(false);
  const lastPaintedCellRef = useRef<{row: number, col: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const isRunningRef = useRef(isRunning);
  const speedRef = useRef(speed);
  const gridRef = useRef(grid); 
  const boundaryConditionRef = useRef(boundaryCondition);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentCellSize, setCurrentCellSize] = useState(DESKTOP_CELL_SIZE);

  useEffect(() => {
    setCurrentCellSize(isMobile ? MOBILE_CELL_SIZE : DESKTOP_CELL_SIZE);
  }, [isMobile]);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { boundaryConditionRef.current = boundaryCondition; }, [boundaryCondition]);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      const accentColorValue = computedStyle.getPropertyValue(CSS_VAR_ACCENT).trim();
      const mutedColorValue = computedStyle.getPropertyValue(CSS_VAR_MUTED).trim();
      const borderColorValue = computedStyle.getPropertyValue(CSS_VAR_BORDER).trim();

      if (accentColorValue) setActualCellAliveColor(`hsl(${accentColorValue})`);
      if (mutedColorValue) setActualCellDeadColor(`hsl(${mutedColorValue})`);
      if (borderColorValue) setActualGridLineColor(`hsla(${borderColorValue}, 0.4)`);

      try {
        const storedSeeds = localStorage.getItem(CUSTOM_SEEDS_STORAGE_KEY);
        if (storedSeeds) {
          setCustomSeedPatterns(JSON.parse(storedSeeds));
        }
      } catch (error) {
        console.error("Failed to load custom seeds from localStorage:", error);
        toast({ title: "Error", description: "Could not load custom seeds.", variant: "destructive" });
      }
    }
  }, [toast]);


  const drawGrid = useCallback(() => {
    if (!canvasRef.current || !mounted || !actualCellAliveColor || !actualCellDeadColor || !actualGridLineColor) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        ctx.fillStyle = grid[row] && grid[row][col] ? actualCellAliveColor : actualCellDeadColor;
        ctx.fillRect(col * currentCellSize, row * currentCellSize, currentCellSize, currentCellSize);
      }
    }

    ctx.strokeStyle = actualGridLineColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= gridSize.cols; i++) {
      ctx.moveTo(i * currentCellSize, 0);
      ctx.lineTo(i * currentCellSize, gridSize.rows * currentCellSize);
    }
    for (let j = 0; j <= gridSize.rows; j++) {
      ctx.moveTo(0, j * currentCellSize);
      ctx.lineTo(gridSize.cols * currentCellSize, j * currentCellSize);
    }
    ctx.stroke();
  }, [grid, gridSize, mounted, actualCellAliveColor, actualCellDeadColor, actualGridLineColor, currentCellSize]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = gridSize.cols * currentCellSize;
      canvasRef.current.height = gridSize.rows * currentCellSize;
    }
    drawGrid();
  }, [gridSize, currentCellSize, drawGrid]);


  const runSimulationStep = useCallback(() => {
    setGrid(currentGrid => { 
      const nextGrid = getNextGeneration(currentGrid, boundaryConditionRef.current);
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, currentGrid]; 
        return updatedHistory.length > MAX_HISTORY_SIZE 
          ? updatedHistory.slice(updatedHistory.length - MAX_HISTORY_SIZE) 
          : updatedHistory;
      });
      return nextGrid;
    });
  }, []); 
  
  const simulationLoop = useCallback(() => {
    if (!isRunningRef.current) return;
    runSimulationStep();
    timeoutIdRef.current = setTimeout(() => {
      animationFrameIdRef.current = requestAnimationFrame(simulationLoop);
    }, speedRef.current);
  }, [runSimulationStep]);

  useEffect(() => {
    if (isRunning) {
      animationFrameIdRef.current = requestAnimationFrame(simulationLoop);
    } else {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    }
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [isRunning, simulationLoop]);

  const handleStart = () => setIsRunning(true);
  const handlePause = useCallback(() => setIsRunning(false), []);

  const handleStepForward = () => {
    if (isRunning) return;
    runSimulationStep();
  };
  
  const handleReset = useCallback((randomize = true) => {
    setIsRunning(false);
    setGrid(createGrid(gridSize.rows, gridSize.cols, randomize));
    setHistory([]);
    setSelectedSeedName(''); 
    setTextToSeed('');
  }, [gridSize.rows, gridSize.cols]);
  
  const handleStepBackward = () => {
    if (isRunning || history.length === 0) return;
    const lastState = history[history.length - 1];
    setGrid(lastState);
    setHistory(prevHistory => prevHistory.slice(0, -1));
  };
  
  const toggleCellAndRecordHistory = useCallback((row: number, col: number) => {
    if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, gridRef.current]; 
        return updatedHistory.length > MAX_HISTORY_SIZE 
          ? updatedHistory.slice(updatedHistory.length - MAX_HISTORY_SIZE) 
          : updatedHistory;
      });
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(arr => arr.slice());
        newGrid[row][col] = newGrid[row][col] ? 0 : 1;
        return newGrid;
      });
    }
  }, [gridSize.rows, gridSize.cols]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (isRunningRef.current) handlePause(); 

    setIsPainting(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / currentCellSize);
    const row = Math.floor(y / currentCellSize);

    toggleCellAndRecordHistory(row, col);
    lastPaintedCellRef.current = { row, col };
  }, [handlePause, toggleCellAndRecordHistory, currentCellSize]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / currentCellSize);
    const row = Math.floor(y / currentCellSize);

    if (lastPaintedCellRef.current && lastPaintedCellRef.current.row === row && lastPaintedCellRef.current.col === col) {
      return; 
    }
    
    toggleCellAndRecordHistory(row, col);
    lastPaintedCellRef.current = { row, col };
  }, [isPainting, toggleCellAndRecordHistory, currentCellSize]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    lastPaintedCellRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPainting) {
      setIsPainting(false);
      lastPaintedCellRef.current = null;
    }
  }, [isPainting]);
  
  const handleGridSizeChange = useCallback((newRows: number, newCols: number) => {
    setGridSize({ rows: newRows, cols: newCols });
  }, []);

  useEffect(() => {
    handleReset(true); 
  }, [gridSize.rows, gridSize.cols, handleReset]);

  const handlePlantSeed = useCallback(() => {
    if (!selectedSeedName) return;

    const allSeeds = [...PREDEFINED_SEED_PATTERNS, ...customSeedPatterns];
    const seedToPlant = allSeeds.find(s => s.name === selectedSeedName);

    if (!seedToPlant) {
        toast({ title: "Error", description: "Selected seed not found.", variant: "destructive" });
        return;
    }

    setIsRunning(false); 
    const newGrid = createGrid(gridSize.rows, gridSize.cols, false); 
    const patternRows = seedToPlant.pattern.length;
    const patternCols = seedToPlant.pattern[0]?.length || 0;

    if (patternRows === 0 || patternCols === 0) return;
    if (patternRows > gridSize.rows || patternCols > gridSize.cols) {
        toast({ title: "Error", description: "Seed pattern is too large for the current grid size.", variant: "destructive" });
        return;
    }
    
    const startRow = Math.floor((gridSize.rows - patternRows) / 2);
    const startCol = Math.floor((gridSize.cols - patternCols) / 2);

    for (let i = 0; i < patternRows; i++) {
        for (let j = 0; j < patternCols; j++) {
            if (seedToPlant.pattern[i][j] === 1) {
                const gridRow = startRow + i;
                const gridCol = startCol + j;
                if (gridRow >= 0 && gridRow < gridSize.rows && gridCol >= 0 && gridCol < gridSize.cols) {
                    newGrid[gridRow][gridCol] = 1;
                }
            }
        }
    }
    setGrid(newGrid);
    setHistory([]); 
    setTextToSeed(''); 
    if (isMobile) setIsSheetOpen(false);
  }, [selectedSeedName, gridSize.rows, gridSize.cols, toast, customSeedPatterns, isMobile]);

  const handlePlantText = useCallback(() => {
    if (!textToSeed.trim()) {
        toast({ title: "Info", description: "Please enter some text to seed."});
        return;
    }
    setIsRunning(false);
    const { grid: newGrid, error } = renderTextToGrid(textToSeed, gridSize.rows, gridSize.cols);

    if (error || !newGrid) {
        toast({ title: "Error", description: error || "Could not render text.", variant: "destructive" });
        return;
    }
    setGrid(newGrid);
    setHistory([]);
    setSelectedSeedName(''); 
    if (isMobile) setIsSheetOpen(false);
  }, [textToSeed, gridSize.rows, gridSize.cols, toast, isMobile]);

  const handleSaveCustomSeed = useCallback(() => {
    const name = customSeedNameInput.trim();
    if (!name) {
      toast({ title: "Error", description: "Please enter a name for your custom pattern.", variant: "destructive" });
      return;
    }

    const extractedPattern = extractPatternFromGrid(gridRef.current);
    if (!extractedPattern || extractedPattern.length === 0 || extractedPattern[0].length === 0) {
      toast({ title: "Error", description: "Cannot save an empty pattern. Add some live cells.", variant: "destructive" });
      return;
    }

    const newCustomSeed: SeedPattern = { name, pattern: extractedPattern, description: "Custom saved pattern" };
    
    setCustomSeedPatterns(prevCustomSeeds => {
      const existingIndex = prevCustomSeeds.findIndex(seed => seed.name === name);
      let updatedSeeds;
      if (existingIndex !== -1) {
        updatedSeeds = [...prevCustomSeeds];
        updatedSeeds[existingIndex] = newCustomSeed;
      } else {
        updatedSeeds = [...prevCustomSeeds, newCustomSeed];
      }
      try {
        localStorage.setItem(CUSTOM_SEEDS_STORAGE_KEY, JSON.stringify(updatedSeeds));
        toast({ title: "Success", description: `Pattern "${name}" saved successfully!` });
      } catch (error) {
         console.error("Failed to save custom seeds to localStorage:", error);
         toast({ title: "Error", description: "Could not save custom pattern to local storage.", variant: "destructive" });
      }
      return updatedSeeds;
    });
    setCustomSeedNameInput('');
    if (isMobile) setIsSheetOpen(false);
  }, [customSeedNameInput, toast, isMobile]);


  if (!mounted) {
    return <div className="flex justify-center items-center h-full"><p>Loading Styles...</p></div>;
  }
  
  const combinedSeedPatterns = [...PREDEFINED_SEED_PATTERNS, ...customSeedPatterns];

  const controlsPanelContent = (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5" />Controls</CardTitle>
          <CardDescription>Manage the simulation.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {!isMobile ? (
            <>
              <Button onClick={handleStart} disabled={isRunning} className="w-full">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
              <Button onClick={handlePause} disabled={!isRunning} className="w-full">
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            </>
          ) : (
            <p className="col-span-2 text-center text-sm text-muted-foreground">
              Use FAB to Start/Pause
            </p>
          )}
          <Button onClick={handleStepForward} disabled={isRunning} className="w-full">
            <SkipForward className="mr-2 h-4 w-4" /> Step
          </Button
            >
          <Button onClick={handleStepBackward} disabled={isRunning || history.length === 0} className="w-full">
            <SkipBack className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => handleReset(true)} variant="outline" className="col-span-2 w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Random Reset
          </Button>
           <Button onClick={() => handleReset(false)} variant="outline" className="col-span-2 w-full">
            <Wand2 className="mr-2 h-4 w-4" /> Clear Grid
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center"><Zap className="mr-2 h-5 w-5" />Parameters</CardTitle>
          <CardDescription>Adjust simulation settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rows" className="flex items-center"><Rows className="mr-2 h-4 w-4" />Rows ({gridSize.rows})</Label>
            <Slider
              id="rows"
              min={10} max={100} step={1}
              defaultValue={[gridSize.rows]}
              onValueChange={(value) => handleGridSizeChange(value[0], gridSize.cols)}
              aria-label="Grid Rows"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cols" className="flex items-center"><ColumnsIcon className="mr-2 h-4 w-4" />Columns ({gridSize.cols})</Label>
             <Slider
              id="cols"
              min={10} max={100} step={1}
              defaultValue={[gridSize.cols]}
              onValueChange={(value) => handleGridSizeChange(gridSize.rows, value[0])}
              aria-label="Grid Columns"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="speed">Speed ({speed}ms / step)</Label>
            <Slider
              id="speed"
              min={50} max={1000} step={50}
              defaultValue={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              aria-label="Simulation Speed"
            />
             <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="boundaryType" className="flex items-center"><Globe className="mr-2 h-4 w-4" />Boundary Type</Label>
            <Select 
              value={boundaryCondition} 
              onValueChange={(value: BoundaryCondition) => setBoundaryCondition(value)}
            >
              <SelectTrigger id="boundaryType" aria-label="Boundary Type">
                <SelectValue placeholder="Select boundary type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bounded">Bounded</SelectItem>
                <SelectItem value="circular">Circular (Periodic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center"><PackageIcon className="mr-2 h-5 w-5" />Seed Structures</CardTitle>
          <CardDescription>Start with a predefined or custom pattern.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seedSelector">Select Seed</Label>
            <Select 
              value={selectedSeedName} 
              onValueChange={(value) => {
                setSelectedSeedName(value || '');
                if(value) setTextToSeed(''); 
              }}
            >
              <SelectTrigger id="seedSelector" aria-label="Select Seed Structure">
                <SelectValue placeholder="Select a structure..." />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_SEED_PATTERNS.length > 0 && (
                    <SelectGroup>
                        <SelectLabel>Predefined</SelectLabel>
                        {PREDEFINED_SEED_PATTERNS.map(seed => (
                        <SelectItem key={`predefined-${seed.name}`} value={seed.name} title={seed.description}>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{seed.name}</span>
                            </TooltipTrigger>
                            {seed.description && (
                                <TooltipContent side="right" align="start">
                                <p>{seed.description}</p>
                                </TooltipContent>
                            )}
                            </Tooltip>
                        </SelectItem>
                        ))}
                    </SelectGroup>
                )}
                {customSeedPatterns.length > 0 && (
                    <SelectGroup>
                        <SelectLabel>Custom</SelectLabel>
                        {customSeedPatterns.map(seed => (
                        <SelectItem key={`custom-${seed.name}`} value={seed.name} title={seed.description || `Custom pattern: ${seed.name}`}>
                             <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{seed.name}</span>
                            </TooltipTrigger>
                            {(seed.description || `Custom pattern: ${seed.name}`) && (
                                <TooltipContent side="right" align="start">
                                <p>{seed.description || `Custom pattern: ${seed.name}`}</p>
                                </TooltipContent>
                            )}
                            </Tooltip>
                        </SelectItem>
                        ))}
                    </SelectGroup>
                )}
                {PREDEFINED_SEED_PATTERNS.length === 0 && customSeedPatterns.length === 0 && (
                    <SelectItem value="none_available" disabled>No patterns available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePlantSeed} disabled={!selectedSeedName} className="w-full">
            Plant Selected Seed
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center"><Type className="mr-2 h-5 w-5" />Seed Text</CardTitle>
          <CardDescription>Plant text onto the grid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textSeeder">Enter Text</Label>
            <Input 
              id="textSeeder" 
              type="text" 
              placeholder="e.g., HELLO" 
              value={textToSeed}
              onChange={(e) => {
                 setTextToSeed(e.target.value);
                 if(e.target.value) setSelectedSeedName(''); 
              }}
              maxLength={20} 
            />
          </div>
          <Button onClick={handlePlantText} disabled={!textToSeed.trim()} className="w-full">
            Plant Text
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center"><Save className="mr-2 h-5 w-5" />Save Current Pattern</CardTitle>
            <CardDescription>Save the current grid as a new custom seed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="customSeedName">Pattern Name</Label>
                <Input 
                    id="customSeedName" 
                    type="text" 
                    placeholder="My Awesome Pattern" 
                    value={customSeedNameInput}
                    onChange={(e) => setCustomSeedNameInput(e.target.value)}
                    maxLength={50}
                />
            </div>
            <Button onClick={handleSaveCustomSeed} disabled={!customSeedNameInput.trim()} className="w-full">
                Save Pattern
            </Button>
        </CardContent>
      </Card>
    </>
  );

  return (
    <TooltipProvider>
      <div className={`flex ${isMobile ? 'flex-col' : 'md:flex-row'} h-full w-full p-4 gap-4`}>
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="fixed top-20 left-4 z-30 h-12 w-12 rounded-full shadow-lg md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Controls</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Controls & Settings</SheetTitle>
                    <SheetCardDescription>Adjust simulation parameters and load/save patterns.</SheetCardDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {controlsPanelContent}
                </div>
                 <SheetCardDescription className="text-center text-xs p-4 border-t">
                    Click/drag cells. Max history: {MAX_HISTORY_SIZE}.
                </SheetCardDescription>
            </SheetContent>
          </Sheet>
        )}

        <main className={`flex-1 flex flex-col items-center justify-center bg-card p-4 rounded-lg shadow-lg overflow-hidden ${isMobile ? 'mt-0' : ''}`}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="border border-border cursor-pointer shadow-inner"
            aria-label="Game of Life Grid"
          />
        </main>

        {!isMobile && (
          <aside className="w-full md:w-80 lg:w-96 bg-card p-6 rounded-lg shadow-lg space-y-6 overflow-y-auto">
            {controlsPanelContent}
             <CardDescription className="text-center text-xs">
                Click and drag on cells to toggle their state. Use controls to manage the simulation.
                Max history: {MAX_HISTORY_SIZE} steps.
             </CardDescription>
          </aside>
        )}

        {isMobile && (
          <Button
            onClick={isRunning ? handlePause : handleStart}
            className="fixed bottom-6 right-6 z-30 h-16 w-16 rounded-full shadow-xl flex items-center justify-center"
            size="icon"
            aria-label={isRunning ? "Pause simulation" : "Start simulation"}
          >
            {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
