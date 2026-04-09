import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  loading = true;
  showAddForm = false;
  editingTask: any = null;
  newTask = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium'
  };

  get stats() {
    return {
      total: this.tasks.length,
      todo: this.tasks.filter(t => t.status === 'todo').length,
      inProgress: this.tasks.filter(t => t.status === 'in_progress').length,
      done: this.tasks.filter(t => t.status === 'done').length
    };
  }

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Dashboard ngOnInit called');
    console.log('Is browser?', isPlatformBrowser(this.platformId));
    
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Skipping on server');
      this.loading = false; // Set loading to false on server to prevent stuck state
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    
    if (!token) {
      console.warn('No token found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  loadTasks() {
    console.log('loadTasks called');
    this.apiService.getTasks().subscribe({
      next: (data) => {
        console.log('Tasks loaded successfully:', data);
        this.tasks = data;
        this.loading = false;
        console.log('Loading set to false, loading =', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Full error object:', JSON.stringify(err, null, 2));
        alert(`Failed to load tasks: ${err.status} - ${err.message}`);
        this.loading = false;
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newTask = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium'
    };
  }

  createTask() {
    if (!this.newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    this.apiService.createTask(this.newTask).subscribe({
      next: (task) => {
        console.log('Task created:', task);
        this.tasks.unshift(task);
        this.resetForm();
        this.showAddForm = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        alert('Failed to create task');
      }
    });
  }

  editTask(task: any) {
    this.editingTask = { ...task };
  }

  cancelEdit() {
    this.editingTask = null;
  }

  updateTask() {
    if (!this.editingTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    this.apiService.updateTask(this.editingTask.id, this.editingTask).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.editingTask = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        alert('Failed to update task');
      }
    });
  }

  deleteTask(taskId: number) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    console.log('Deleting task with ID:', taskId);
    this.apiService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task deleted successfully');
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        console.error('Error details:', err.error);
        alert(`Failed to delete task: ${err.error?.message || err.message}`);
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'todo': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'done': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityColor(priority: string): string {
    const colors: any = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  }

  getPriorityIcon(priority: string): string {
    const icons: any = {
      'low': '⬇️',
      'medium': '➡️',
      'high': '🔥'
    };
    return icons[priority] || '➡️';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done'
    };
    return labels[status] || status;
  }
} 
