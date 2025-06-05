
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, RefreshCw, SkipBack, Settings2, Zap, Rows, ColumnsIcon, Globe, PackageIcon, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Grid, createGrid, getNextGeneration, type BoundaryCondition, SEED_PATTERNS, type SeedPattern } from '@/lib/game-of-life';

const DEFAULT_ROWS = 40;
const DEFAULT_COLS = 60;
const CELL_SIZE = 12; 
const DEFAULT_SPEED_MS = 150;
const MAX_HISTORY_SIZE = 100;

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
  const gridRef = useRef(grid); // Keep this for read-only access in callbacks if needed
  const boundaryConditionRef = useRef(boundaryCondition);

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
    }
  }, []);


  const drawGrid = useCallback(() => {
    if (!canvasRef.current || !mounted || !actualCellAliveColor || !actualCellDeadColor || !actualGridLineColor) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        ctx.fillStyle = grid[row] && grid[row][col] ? actualCellAliveColor : actualCellDeadColor;
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.strokeStyle = actualGridLineColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= gridSize.cols; i++) {
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, gridSize.rows * CELL_SIZE);
    }
    for (let j = 0; j <= gridSize.rows; j++) {
      ctx.moveTo(0, j * CELL_SIZE);
      ctx.lineTo(gridSize.cols * CELL_SIZE, j * CELL_SIZE);
    }
    ctx.stroke();
  }, [grid, gridSize, mounted, actualCellAliveColor, actualCellDeadColor, actualGridLineColor]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const runSimulationStep = useCallback(() => {
    setGrid(currentGrid => { // currentGrid is the latest state
      const nextGrid = getNextGeneration(currentGrid, boundaryConditionRef.current);
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, currentGrid]; // currentGrid is correct here
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
    setSelectedSeedName(''); // Clear selected seed on reset
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
        // Use gridRef.current to ensure the history captures the state *before* the toggle
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
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    toggleCellAndRecordHistory(row, col);
    lastPaintedCellRef.current = { row, col };
  }, [handlePause, toggleCellAndRecordHistory]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (lastPaintedCellRef.current && lastPaintedCellRef.current.row === row && lastPaintedCellRef.current.col === col) {
      return; 
    }
    
    toggleCellAndRecordHistory(row, col);
    lastPaintedCellRef.current = { row, col };
  }, [isPainting, toggleCellAndRecordHistory]);

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
    handleReset(true); // Default to random reset when size changes
  }, [gridSize.rows, gridSize.cols, handleReset]);

  const handlePlantSeed = useCallback(() => {
    if (!selectedSeedName) return;

    const seedToPlant = SEED_PATTERNS.find(s => s.name === selectedSeedName);
    if (!seedToPlant) return;

    setIsRunning(false); 

    const newGrid = createGrid(gridSize.rows, gridSize.cols, false); 

    const patternRows = seedToPlant.pattern.length;
    const patternCols = seedToPlant.pattern[0]?.length || 0;

    if (patternRows === 0 || patternCols === 0) return;
    if (patternRows > gridSize.rows || patternCols > gridSize.cols) {
        alert("Seed pattern is too large for the current grid size.");
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
  }, [selectedSeedName, gridSize.rows, gridSize.cols, setIsRunning, setGrid, setHistory]);


  if (!mounted) {
    return <div className="flex justify-center items-center h-full"><p>Loading Styles...</p></div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row h-full w-full p-4 gap-4">
        <main className="flex-1 flex flex-col items-center justify-center bg-card p-4 rounded-lg shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={gridSize.cols * CELL_SIZE}
            height={gridSize.rows * CELL_SIZE}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="border border-border cursor-pointer shadow-inner"
            aria-label="Game of Life Grid"
          />
        </main>

        <aside className="w-full md:w-80 lg:w-96 bg-card p-6 rounded-lg shadow-lg space-y-6 overflow-y-auto">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5" />Controls</CardTitle>
              <CardDescription>Manage the simulation.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button onClick={handleStart} disabled={isRunning} className="w-full">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
              <Button onClick={handlePause} disabled={!isRunning} className="w-full">
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
              <Button onClick={handleStepForward} disabled={isRunning} className="w-full">
                <SkipForward className="mr-2 h-4 w-4" /> Step
              </Button>
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
              <CardDescription>Start with a predefined pattern.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seedSelector">Select Seed</Label>
                <Select 
                  value={selectedSeedName} 
                  onValueChange={(value) => setSelectedSeedName(value || '')}
                >
                  <SelectTrigger id="seedSelector" aria-label="Select Seed Structure">
                    <SelectValue placeholder="Select a structure..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SEED_PATTERNS.map(seed => (
                      <SelectItem key={seed.name} value={seed.name} title={seed.description}>
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
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePlantSeed} disabled={!selectedSeedName} className="w-full">
                Plant Selected Seed
              </Button>
            </CardContent>
          </Card>

          <CardDescription className="text-center text-xs">
            Click and drag on cells to toggle their state. Use controls to manage the simulation.
            Max history: {MAX_HISTORY_SIZE} steps.
          </CardDescription>
        </aside>
      </div>
    </TooltipProvider>
  );
}
