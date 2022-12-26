import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TodoModel } from 'src/app/models/todo';
import { TodoService } from 'src/app/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit {
  constructor(
    private todoService: TodoService,
    private afAuth: AngularFireAuth
  ) {}

  public todos: TodoModel[] = [];
  public isCreating = false;
  @Input() public date!: string | Date;

  filter(startDate: string, endDate: string): void {
    this.afAuth.idToken.subscribe((token: string | null) => {
      if (token) {
        this.todoService
          .getAllTodosByPeriod(token, {
            startDate: startDate.split('T')[0],
            endDate: endDate.split('T')[0],
          })
          .subscribe((data: TodoModel[]) => {
            this.todos = data;
          });
      }
    });
  }

  ngOnInit(): void {
    this.afAuth.idToken.subscribe((token: string | null) => {
      if (token)
        if (this.date)
          this.todoService
            .getAllTodosByDate(token, this.date.toString())
            .subscribe((data: TodoModel[]) => {
              this.todos = data;
            });
        else
          this.todoService.getAllTodos(token).subscribe((data: TodoModel[]) => {
            this.todos = data;
          });
    });
  }

  reload(fastReload = false) {
    if (fastReload) {
      if (this.date)
        this.todos = this.todos
          .filter((t) => t.date == this.date)
          .sort((a, b) => (a.date > b.date ? 1 : -1));
      else this.todos = this.todos.sort((a, b) => (a.date > b.date ? 1 : -1));

      return;
    }

    this.afAuth.idToken.subscribe((token: string | null) => {
      if (token)
        if (this.date)
          this.todoService
            .getAllTodosByDate(token, this.date.toString())
            .subscribe((data: TodoModel[]) => {
              this.todos = data;
            });
        else
          this.todoService.getAllTodos(token).subscribe((data: TodoModel[]) => {
            this.todos = data;
          });
    });
  }

  deleteTodo(todo: TodoModel) {
    if (!todo.id) {
      this.todos = this.todos.filter((t) => t.id !== todo.id);
      this.isCreating = false;
      return;
    }

    this.afAuth.idToken.subscribe((token: string | null) => {
      if (token)
        this.todoService.deleteTodo({ id: todo.id }, token).subscribe(() => {
          this.todos = this.todos.filter((t) => t.id !== todo.id);
        });
    });
  }

  newTodo() {
    this.isCreating = true;
    const date = new Date(this.date.toString());

    this.todos.push({
      id: '',
      title: '',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), //new Date(this.date.toString()).toISOString(),
      done: false,
    });
  }

  updateTodo(todo: TodoModel) {
    this.isCreating = false;
    this.todos = this.todos.filter((t) => t.id);
    this.todos.push(todo);
  }
}
