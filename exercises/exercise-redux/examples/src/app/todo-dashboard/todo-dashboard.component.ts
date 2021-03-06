import { clear_todos } from '../state/todo/todo.actions';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoService } from '../services/todo.service';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { TodoState } from '../state/todo/todo.reducer';
import { selectedLastUpdate, selectedTodos } from '../state/todo/todo.selectors';
import { Todo } from '../models/todo.model';

@Component({
  selector: 'todo-dashboard',
  templateUrl: './todo-dashboard.component.html',
  styleUrls: ['./todo-dashboard.component.css']
})
export class TodoDashboardComponent {
  // todos: number; 
  // lastUpdate: any; 
  
  // // Read the comment in TodoService
  // constructor(private service: TodoService) { 
  //   this.todos = service.getTodos().length;
    
  //   service.todoAdded.subscribe(() => { 
  //     this.todos++;
  //     this.lastUpdate = new Date();
  //   });

  //   service.todoRemoved.subscribe(() => {
  //     this.todos--;
  //     this.lastUpdate = new Date();
  //   });

  //   service.todoToggled.subscribe(() => {
  //     this.lastUpdate = new Date();
  //   });

  //   service.todosCleared.subscribe(() => {
  //     this.todos = 0; 
  //     this.lastUpdate = new Date();
  //   });
  // }

  // clearTodos() {
  //   this.service.clearTodos();
  // }

  todos$: Observable<Todo[]>;
  lastUpdate$: Observable<Date>;

  constructor(private store: Store<AppState>) {
    this.todos$ = store.select(selectedTodos);
    this.lastUpdate$ = store.select(selectedLastUpdate);
  }

  clearTodos() {
    this.store.dispatch(clear_todos());
  }
}