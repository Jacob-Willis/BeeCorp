import { CollectionInfo } from './CollectionInfo';

export class Colony {
  id: number;
  name = "new colony";
  bee_count = 0;
  hive_count = 0;
  created_at: Date;
  collectionInfo: CollectionInfo[];
}
