import { Board } from './board';
import { observable, action } from 'mobx';

export enum GameRunningState {
    Running,
    Won,
    Failed,
    Stopped,
}

export interface IBoardLevel {
    width: number;
    height: number;
    mines: number;
}

type BoardLevelCollection = {
    [key: string]: IBoardLevel
};

export const BoardLevels: BoardLevelCollection = {
    beginner: {
        width: 9,
        height: 9,
        mines: 12
    },
    intermediate: {
        width: 16,
        height: 16,
        mines: 40
    },
    expert: {
        width: 30,
        height: 16,
        mines: 99
    }
}

export class Game {
    board: Board;

    @observable
    state: GameRunningState = GameRunningState.Stopped;

    @observable
    elapsedSeconds: number = 0;

    @observable
    isTimerRunning: boolean = false;

    startTime: Date;
    timerId: NodeJS.Timer;
    level: IBoardLevel;

    constructor(){
        this.level = BoardLevels.beginner;
        this.start();
    }

    restart(){
        this.stop();
        this.start();
    }

    stop(){
        clearInterval(this.timerId);
        this.isTimerRunning = false;
        this.state = GameRunningState.Stopped;
    }

    start(){
        if(this.state === GameRunningState.Running){
            return;
        }

        this.state = GameRunningState.Running;
        this.elapsedSeconds = 0;
        this.board = new Board(this, this.level.width, this.level.height, this.level.mines);
    }

    startTimer(){
        this.startTime = new Date();
        this.isTimerRunning = true;
        this.timerId = setInterval(this.updateTimer, 1000);
    }

    fail(){
        this.stop();
        this.state = GameRunningState.Failed;
    }

    win(){
        this.stop();
        this.state = GameRunningState.Won;
    }

    @action.bound
    updateTimer(){
        this.elapsedSeconds = Math.round((new Date().getTime() - this.startTime.getTime()) / 1000);
    }

    setLevel(level: IBoardLevel){
        level = {
            width: Math.min(30, Math.max(9, level.width || 9)),
            height: Math.min(24, Math.max(9, level.height || 9)),
            mines: Math.max(10, level.mines || 10)
        };
        level.mines = Math.floor(Math.min(level.width * level.height * 0.85, level.mines));
        this.level = level;
        this.restart();
    }

    isLevel(level: IBoardLevel){
        return this.level.height === level.height && this.level.width === level.width && this.level.mines === level.mines;
    }
}
