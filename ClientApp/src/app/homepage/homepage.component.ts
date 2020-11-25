import { Component, OnInit } from '@angular/core';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { get } from 'https';
import { Colony } from '../colony';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getColonies();
  }

  colonyList: Colony[] = [];
  loading = false;

  getCollectedAmount(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      let amount = 0;

      for (let i = 0; i < colony.collectionInfo.length; i++) {
        amount += colony.collectionInfo[i].collection_amount;
      }
      return amount;
    }
  }

  getLastCollectionDate(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      return colony.collectionInfo[colony.collectionInfo.length - 1].collection_date;
    }
  }

  getCollectionCount(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      let i = 0;
      for (let collection in colony.collectionInfo) {
        i++;
      }
      return i;
    }
  }

  getColonies() {
    this.loading = true;

    const GET_COLONIES = gql`
      {
        colony(order_by: { created_at: asc }) {
          name
          bee_count
          hive_count
          created_at
          collectionInfo(order_by: { collection_date: asc }) {
            collection_date
            collection_amount
          }
        }
      }
    `;

    this.apollo
      .watchQuery({
        query: GET_COLONIES
      })
      .valueChanges.subscribe((result: any) => {
        this.colonyList = result.data.colony;
        this.loading = false;
      })
  }
}
