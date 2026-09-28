'use client';

import React, { useState } from 'react';
import { useCariocaGame } from '../hooks/useCariocaGame';
import CariocaHeader from './CariocaHeader';
import CariocaSetup from './CariocaSetup';
import CariocaScoreboard from './CariocaScoreboard';
import CariocaPodium from './CariocaPodium';
import CariocaRulesModal from './CariocaRulesModal';
import CariocaHistoryModal from './CariocaHistoryModal';

interface CariocaAppProps {
  userEmail?: string | null;
}

export default function CariocaApp({ userEmail }: CariocaAppProps) {
  const {
    // Storage & History
    storageMode,
    history,
    deleteHistoryGame,

    // Setup state
    players,
    selectedRounds,
    activePresetId,
    allAvailablePresets,
    allStandardRounds,
    hasSavedGameToResume,

    // Setup modifiers
    addPlayer,
    removePlayer,
    updatePlayer,
    applyPreset,
    toggleRound,
    moveRound,
    removeRoundByIndex,
    addCustomRound,
    resetSetupToDefault,

    // Game state & operations
    game,
    status,
    currentRoundIndex,
    activeRound,
    allRoundsCompleted,
    leaderboard,
    leader,

    // Lifecycle
    startGame,
    resumeSavedGame,
    discardSavedGame,
    setPlayerScore,
    setQuickZero,
    setCurrentRoundIndex,
    nextRound,
    prevRound,
    finishGame,
    rematchGame,
    newGameFromScratch,
  } = useCariocaGame({ userEmail });

  // Modals state
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // Allow viewing scoreboard even when finished
  const [forceViewScoreboard, setForceViewScoreboard] = useState(false);

  // Handle return to setup while preserving players
  const handleEditSetup = () => {
    setForceViewScoreboard(false);
    newGameFromScratch();
  };

  const handleStartGame = (title?: string) => {
    setForceViewScoreboard(false);
    startGame(title);
  };

  const handleFinishGame = () => {
    setForceViewScoreboard(false);
    finishGame();
  };

  const currentView =
    status === 'setup'
      ? 'setup'
      : status === 'finished' && !forceViewScoreboard
      ? 'podium'
      : 'scoreboard';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#04281f] via-[#021a14] to-[#01110d] text-slate-100 selection:bg-amber-500 selection:text-emerald-950 transition-colors relative overflow-x-hidden">
      {/* Table Ambient Glow Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <CariocaHeader
        status={status}
        storageMode={storageMode}
        userEmail={userEmail}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewGame={newGameFromScratch}
      />

      {/* Main Game Screen */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'setup' && (
          <CariocaSetup
            players={players}
            selectedRounds={selectedRounds}
            allAvailablePresets={allAvailablePresets}
            allStandardRounds={allStandardRounds}
            activePresetId={activePresetId}
            hasSavedGameToResume={hasSavedGameToResume}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onUpdatePlayer={updatePlayer}
            onApplyPreset={applyPreset}
            onToggleRound={toggleRound}
            onMoveRound={moveRound}
            onRemoveRoundByIndex={removeRoundByIndex}
            onAddCustomRound={addCustomRound}
            onResetSetupToDefault={resetSetupToDefault}
            onStartGame={handleStartGame}
            onResumeSavedGame={resumeSavedGame}
            onDiscardSavedGame={discardSavedGame}
          />
        )}

        {currentView === 'scoreboard' && game && (
          <CariocaScoreboard
            game={game}
            leaderboard={leaderboard}
            leader={leader}
            currentRoundIndex={currentRoundIndex}
            activeRound={activeRound}
            allRoundsCompleted={allRoundsCompleted}
            onSetPlayerScore={setPlayerScore}
            onSetQuickZero={setQuickZero}
            onSetCurrentRoundIndex={setCurrentRoundIndex}
            onNextRound={nextRound}
            onPrevRound={prevRound}
            onFinishGame={handleFinishGame}
            onNewGame={newGameFromScratch}
          />
        )}

        {currentView === 'podium' && game && (
          <CariocaPodium
            game={game}
            leaderboard={leaderboard}
            onRematch={rematchGame}
            onEditSetup={handleEditSetup}
            onNewGame={newGameFromScratch}
            onViewScoreboard={() => setForceViewScoreboard(true)}
          />
        )}
      </main>

      {/* Modals */}
      <CariocaRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <CariocaHistoryModal
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onDeleteGame={deleteHistoryGame}
      />
    </div>
  );
}
