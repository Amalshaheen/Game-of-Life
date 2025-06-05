"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, RefreshCw, SkipBack, Settings2, Zap, Rows, ColumnsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Grid, createGrid, getNextGeneration } from '@/lib/game-of-life';

const DEFAULT_ROWS = 40;
const DEFAULT_COLS = 60;
const CELL_SIZE = 12; // px
const DEFAULT_SPEED_MS = 150;
const MAX_HISTORY_SIZE = 100;

const CELL_ALIVE_COLOR_VAR = "hsl(var(--accent))";
const CELL_DEAD_COLOR_VAR = "hsl(var(--muted))";
const GRID_LINE_COLOR_VAR = "hsl(var(--border))";


export default function CellularAutomataExplorer() {
  const [gridSize, setGridSize] = useState({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });
  const [grid, setGrid] = useState<Grid>(() => createGrid(gridSize.rows, gridSize.cols, true));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED_MS);
  const [history, setHistory] = useState<Grid[]>([]);
  
  const [mounted, setMounted] = useState(false);
  const [actualCellAliveColor, setActualCellAliveColor] = useState('');
  const [actualCellDeadColor, setActualCellDeadColor] = useState('');
  const [actualGridLineColor, setActualGridLineColor] = useState('');


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for simulation loop to access latest state without re-creating callback
  const isRunningRef = useRef(isRunning);
  const speedRef = useRef(speed);
  const gridRef = useRef(grid); // To access current grid in callbacks for history

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  
  useEffect(() => {
    setMounted(true);
    // Dynamically get CSS variable values on client
    if (typeof window !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      setActualCellAliveColor(computedStyle.getPropertyValue('--accent').trim());
      setActualCellDeadColor(computedStyle.getPropertyValue('--muted').trim());
      setActualGridLineColor(computedStyle.getPropertyValue('--border').trim());
    }
  }, []);


  const drawGrid = useCallback(() => {
    if (!canvasRef.current || !mounted) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        ctx.fillStyle = grid[row] && grid[row][col] ? actualCellAliveColor : actualCellDeadColor;
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw grid lines
    ctx.strokeStyle = actualGridLineColor;
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
    setGrid(currentGrid => {
      const nextGrid = getNextGeneration(currentGrid);
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
  const handlePause = () => setIsRunning(false);

  const handleStepForward = () => {
    if (isRunning) return;
    runSimulationStep();
  };

  const handleReset = (randomize = true) => {
    setIsRunning(false);
    setGrid(createGrid(gridSize.rows, gridSize.cols, randomize));
    setHistory([]);
  };
  
  const handleStepBackward = () => {
    if (isRunning || history.length === 0) return;
    const lastState = history[history.length - 1];
    setGrid(lastState);
    setHistory(prevHistory => prevHistory.slice(0, -1));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (isRunning) handlePause();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(arr => arr.slice()); // Deep copy
        newGrid[row][col] = newGrid[row][col] ? 0 : 1;
        return newGrid;
      });
      // Painting modifies the current state, new history will build from here
      // For simplicity, we don't clear history here, it acts as an "edit"
    }
  };

  useEffect(() => {
    handleReset(true); // Initialize with a random grid on size change
  }, [gridSize.rows, gridSize.cols]);


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
            onClick={handleCanvasClick}
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
                <RefreshCw className="mr-2 h-4 w-4" /> Clear Grid
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
                  onValueChange={(value) => setGridSize(s => ({ ...s, rows: value[0] }))}
                  aria-label="Grid Rows"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols" className="flex items-center"><ColumnsIcon className="mr-2 h-4 w-4" />Columns ({gridSize.cols})</Label>
                 <Slider
                  id="cols"
                  min={10} max={100} step={1}
                  defaultValue={[gridSize.cols]}
                  onValueChange={(value) => setGridSize(s => ({ ...s, cols: value[0] }))}
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
            </CardContent>
          </Card>
          <CardDescription className="text-center text-xs">
            Click on cells to toggle their state. Use controls to manage the simulation.
            Max history: {MAX_HISTORY_SIZE} steps.
          </CardDescription>
        </aside>
      </div>
    </TooltipProvider>
  );
}
