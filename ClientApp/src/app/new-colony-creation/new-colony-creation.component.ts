import { Component, OnInit } from '@angular/core';
import { Colony } from '../colony';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

@Component({
  selector: 'app-new-hive-creation',
  templateUrl: './new-colony-creation.component.html',
  styleUrls: ['./new-colony-creation.component.css']
})
export class NewColonyCreationComponent implements OnInit {

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
  }

  colonyName = "new colony";
  beeCount = 0;
  hiveCount = 0;
  loading = false;

  saveNewColony() {
    this.loading = true;

    const ADD_NEWCOLONY = gql`
    mutation ($_name: String!, $_bee_count: numeric!, $_hive_count: numeric!) {
      insert_colony(objects: {
        name: $_name,
        bee_count: $_bee_count,
        hive_count: $_hive_count
      }) {
        affected_rows
        returning {
          id,
          name,
          bee_count,
          hive_count
        }
      }
    }
    `;

    this.apollo.mutate({
      mutation: ADD_NEWCOLONY,
      variables: { _name: this.colonyName, _bee_count: this.beeCount, _hive_count: this.hiveCount }
    }).subscribe((data: any) => {
      this.loading = false;
    }, (error) => {
      console.log("There was an error", error);
    });
  }

}
