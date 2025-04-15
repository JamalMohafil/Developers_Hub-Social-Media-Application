import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_KEY } from './constants';

@Injectable()
export class AppService {
  

  getData2() {
    return 'adsfg';
  }

  
}
