// optional-jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class CheckUserGuard extends AuthGuard('check-user') {
  // تجاوز دالة canActivate لمعالجة الخطأ عند عدم وجود توكن
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // استخدام نمط التحقق من النوع قبل استدعاء .catch
    const result = super.canActivate(context);

    // إذا كانت النتيجة وعداً (Promise)
    if (result instanceof Promise) {
      return result.catch((error) => {
        // إذا كان الخطأ بسبب عدم وجود توكن
        if (error.message === 'No auth token') {
          // تعيين req.user إلى null
          const request = context.switchToHttp().getRequest();
          request.user = null;
          // السماح بالمرور
          return true;
        }
        // إعادة رمي الخطأ إذا كان خطأ آخر
        throw error;
      });
    }

    // إذا كانت النتيجة Observable
    if (result instanceof Observable) {
      return new Observable((subscriber) => {
        result.subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => {
            // إذا كان الخطأ بسبب عدم وجود توكن
            if (error.message === 'No auth token') {
              // تعيين req.user إلى null
              const request = context.switchToHttp().getRequest();
              request.user = null;
              // السماح بالمرور
              subscriber.next(true);
              subscriber.complete();
            } else {
              // إرسال الخطأ إذا كان خطأ آخر
              subscriber.error(error);
            }
          },
          complete: () => subscriber.complete(),
        });
      });
    }

    // إذا كانت النتيجة boolean، نرجعها كما هي
    return result;
  }

  // تجاوز دالة handleRequest للتأكد من عدم رمي استثناء
  handleRequest(err: any, user: any, info: any) {
    // عدم رمي استثناء إذا لم يكن هناك مستخدم
    return user;
  }
}
