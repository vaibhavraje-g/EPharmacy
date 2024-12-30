import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MedicineService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.medicineMSUrl;

  getAllMedicines(
    pageNumber: number,
    pageSize: number = 40
  ): Observable<any[]> {
    return this.http
      .get<{ medicine: any[] }>(
        `${this.apiUrl}medicines/pageNumber/${pageNumber}/pageSize/${pageSize}`
      )
      .pipe(map((response: { medicine: any[] }) => response.medicine));
  }

  getMedicineById(medicineId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}medicines/${medicineId}`);
  }

  getMedicinesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}medicines/category/${category}`);
  }

  updateStock(medicineId: string, stock: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}medicines/update-stock/medicine/${medicineId}`,
      { stock }
    );
  }
}
